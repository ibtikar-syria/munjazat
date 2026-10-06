export const MAX_SUBMISSION_BYTES = 100 * 1024 * 1024
export const MAX_MEDIA_FILES = 20
export const MAX_RELATED_LINKS = 20

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])

const EXT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export function sanitizeFileName(name: string) {
  const base = name.replace(/\\/g, '/').split('/').pop() || 'file'
  const cleaned = base.replace(/[^\w.\u0600-\u06FF-]+/g, '_').slice(0, 120)
  return cleaned || 'file'
}

export function resolveContentType(file: { name: string; type: string }) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const fromName = EXT_TYPES[ext]
  const type = file.type || fromName || ''
  if (!ALLOWED_TYPES.has(type)) return null
  return type
}

export function parseHttpUrl(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}

export function normalizeRelatedLinks(input: unknown) {
  if (!Array.isArray(input)) return []
  const out: string[] = []
  for (const item of input) {
    if (typeof item !== 'string') continue
    const url = parseHttpUrl(item)
    if (!url) continue
    if (url.length > 2048) continue
    if (!out.includes(url)) out.push(url)
    if (out.length >= MAX_RELATED_LINKS) break
  }
  return out
}
