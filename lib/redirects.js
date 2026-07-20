const EXCLUDED_PATHS = /^(?:\/api(?:\/|$)|\/_next(?:\/|$)|\/favicon\.ico$|\/robots\.txt$|\/ads\.txt$|\/sitemap(?:_index)?\.xml$|\/(?:post|page|category)-sitemap\.xml$)/i

export function normalizeRedirectPath(pathname) {
  const path = String(pathname || '').trim()
  if (!path.startsWith('/') || path.startsWith('//')) return '/'
  return path === '/' ? '/' : path.replace(/\/+$/, '') || '/'
}

export function isExcludedRedirectPath(pathname) {
  return EXCLUDED_PATHS.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)
}
