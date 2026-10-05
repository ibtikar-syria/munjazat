const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return [...view].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  return `pbkdf2$100000$${toHex(salt)}$${toHex(bits)}`
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, iterStr, saltHex, hashHex] = stored.split('$')
  if (algo !== 'pbkdf2' || !iterStr || !saltHex || !hashHex) return false
  const iterations = Number(iterStr)
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits) === hashHex
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token))
  return toHex(digest)
}
