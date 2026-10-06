import { parseHttpUrl, type RelatedLink } from './media'

export type { RelatedLink }

const FETCH_MS = 8000
const MAX_HTML_BYTES = 512 * 1024
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const PREVIEW_UA =
  'Mozilla/5.0 (compatible; MunjazatPreview/1.0; +https://munjazat.local) AppleWebKit/537.36 (KHTML, like Gecko)'

export function emptyLinkPreview(url: string): RelatedLink {
  return {
    url,
    title: null,
    description: null,
    imageKey: null,
    imageUrl: null,
    siteName: null,
  }
}

export function isSafePublicHttpUrl(raw: string) {
  const parsed = parseHttpUrl(raw)
  if (!parsed) return null
  try {
    const url = new URL(parsed)
    if (isPrivateHostname(url.hostname)) return null
    return url
  } catch {
    return null
  }
}

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '0.0.0.0') {
    return true
  }
  if (host.includes(':')) return true
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }
  return false
}

function decodeMeta(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function clip(value: string | null, max: number) {
  if (!value) return null
  const text = decodeMeta(value)
  if (!text) return null
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

function resolveUrl(base: string, maybeRelative: string | null) {
  if (!maybeRelative) return null
  try {
    const url = new URL(maybeRelative, base)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (isPrivateHostname(url.hostname)) return null
    return url.toString()
  } catch {
    return null
  }
}

async function hashKey(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

async function fetchLimited(url: string, headers: HeadersInit, maxBytes: number) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_MS),
    headers,
  })
  const finalUrl = res.url || url
  if (!isSafePublicHttpUrl(finalUrl)) {
    throw new Error('blocked')
  }
  return { res, finalUrl, maxBytes }
}

async function consumeLimited(res: Response, maxBytes: number, transform?: (response: Response) => Response) {
  const source = transform ? transform(res) : res
  if (!source.body) {
    await source.arrayBuffer()
    return
  }
  const reader = source.body.getReader()
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      break
    }
  }
}

export async function fetchLinkPreview(pageUrl: string, bucket: R2Bucket): Promise<RelatedLink> {
  const start = isSafePublicHttpUrl(pageUrl)
  if (!start) {
    throw new Error('invalid')
  }

  const { res, finalUrl } = await fetchLimited(
    start.toString(),
    {
      'User-Agent': PREVIEW_UA,
      Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
    },
    MAX_HTML_BYTES,
  )

  const preview = emptyLinkPreview(finalUrl)
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || (contentType && !/html|xml|text\//i.test(contentType))) {
    await res.body?.cancel()
    preview.siteName = start.hostname.replace(/^www\./, '')
    return preview
  }

  const meta: Record<string, string> = {}
  let titleText = ''
  const rewriter = new HTMLRewriter()
    .on('meta', {
      element(el) {
        const key = (el.getAttribute('property') || el.getAttribute('name') || '').toLowerCase()
        const content = el.getAttribute('content')
        if (key && content) meta[key] = content
      },
    })
    .on('title', {
      text(chunk) {
        titleText += chunk.text
      },
    })
    .on('link', {
      element(el) {
        const rel = (el.getAttribute('rel') || '').toLowerCase()
        const href = el.getAttribute('href')
        if (href && (rel.includes('apple-touch-icon') || rel.split(/\s+/).includes('icon'))) {
          if (!meta.icon) meta.icon = href
        }
      },
    })

  await consumeLimited(res, MAX_HTML_BYTES, (response) => rewriter.transform(response))

  preview.title =
    clip(meta['og:title'] || meta['twitter:title'] || titleText, 180) || start.hostname.replace(/^www\./, '')
  preview.description = clip(meta['og:description'] || meta['twitter:description'] || meta.description, 240)
  preview.siteName = clip(meta['og:site_name'], 80) || start.hostname.replace(/^www\./, '')
  preview.imageUrl = resolveUrl(finalUrl, meta['og:image'] || meta['twitter:image'] || meta['og:image:url'])

  if (preview.imageUrl) {
    preview.imageKey = await storePreviewImage(bucket, preview.imageUrl)
  }

  return preview
}

async function storePreviewImage(bucket: R2Bucket, imageUrl: string) {
  const safe = isSafePublicHttpUrl(imageUrl)
  if (!safe) return null
  const key = await hashKey(safe.toString())
  const existing = await bucket.head(`link-previews/${key}`)
  if (existing) return key

  try {
    const { res } = await fetchLimited(
      safe.toString(),
      { 'User-Agent': PREVIEW_UA, Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
      MAX_IMAGE_BYTES,
    )
    if (!res.ok || !res.body) return null
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!type.startsWith('image/') || type.includes('svg')) return null
    const length = Number(res.headers.get('content-length') || 0)
    if (length > MAX_IMAGE_BYTES) return null
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_IMAGE_BYTES) return null
    await bucket.put(`link-previews/${key}`, buffer, {
      httpMetadata: { contentType: type },
    })
    return key
  } catch {
    return null
  }
}

export function previewImagePath(imageKey: string | null) {
  if (!imageKey || !/^[a-f0-9]{16,64}$/.test(imageKey)) return null
  return `link-previews/${imageKey}`
}
