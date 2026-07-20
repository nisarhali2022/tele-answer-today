import crypto from 'node:crypto'

export function verifyCmsRevalidationSecret(request, expectedSecret) {
  const provided = request.headers.get('x-cms-revalidation-secret') || ''
  const expected = String(expectedSecret || '')
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)

  return Boolean(expected) && left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function normalizeCmsRevalidationPayload(payload = {}) {
  return {
    event: payload.event || null,
    paths: Array.isArray(payload.paths)
      ? payload.paths.filter((path) => typeof path === 'string' && path.startsWith('/'))
      : [],
    resourceType: payload.resourceType || null,
    resourceId: payload.resourceId || null,
  }
}
