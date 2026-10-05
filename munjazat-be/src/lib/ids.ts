export function createId(prefix?: string) {
  const id = crypto.randomUUID().replace(/-/g, '')
  return prefix ? `${prefix}_${id}` : id
}

export function createTrackingCode() {
  const part = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `MJZ-${part}`
}
