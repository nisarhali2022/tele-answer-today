import { resolveCmsDomain } from './cmsDomain'

const EXCLUDED_PATHS = /^(?:\/api(?:\/|$)|\/_next(?:\/|$)|\/favicon\.ico$|\/robots\.txt$|\/ads\.txt$|\/sitemap(?:_index)?\.xml$|\/(?:post|page|category)-sitemap\.xml$)/i

export function normalizeRedirectPath(pathname) {
  const path = String(pathname || '').trim()
  if (!path.startsWith('/') || path.startsWith('//')) return '/'
  return path === '/' ? '/' : path.replace(/\/+$/, '') || '/'
}

export function isExcludedRedirectPath(pathname) {
  return EXCLUDED_PATHS.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)
}

export function resolveRedirectDestination(toUrl, requestUrl, domain) {
  const rawDestination = String(toUrl || '').trim()
  if (!rawDestination || rawDestination.startsWith('//')) return null

  if (rawDestination.startsWith('/')) {
    const destination = new URL(rawDestination, requestUrl)
    destination.pathname = normalizeRedirectPath(destination.pathname)
    return destination
  }

  try {
    const destination = new URL(rawDestination)
    const destinationDomain = resolveCmsDomain(destination.host, domain)
    if (
      !['http:', 'https:'].includes(destination.protocol) ||
      destinationDomain !== domain
    ) {
      return null
    }

    destination.protocol = 'https:'
    destination.hostname = domain
    destination.port = ''
    destination.pathname = normalizeRedirectPath(destination.pathname)
    return destination
  } catch {
    return null
  }
}
