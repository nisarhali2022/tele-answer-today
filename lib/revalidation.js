const ALWAYS_REVALIDATE_PATHS = [
  '/',
  '/sitemap_index.xml',
  '/post-sitemap.xml',
  '/page-sitemap.xml',
  '/category-sitemap.xml',
]

function normalizePath(value) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  let path = trimmed
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      path = new URL(trimmed).pathname
    } catch {
      return null
    }
  }

  path = path.split('?')[0].split('#')[0].replace(/\\/g, '/')
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/{2,}/g, '/')

  return path === '/' ? '/' : path.replace(/\/+$/g, '')
}

function normalizeSegment(value) {
  if (typeof value !== 'string') return null
  const segment = value.trim().replace(/^\/+|\/+$/g, '')
  return segment && !segment.includes('/') ? segment : null
}

export function getRevalidationPaths({ path, slug, category } = {}) {
  const paths = new Set(ALWAYS_REVALIDATE_PATHS)
  const normalizedPath = normalizePath(path)
  const normalizedSlug = normalizeSegment(slug)
  const normalizedCategory = normalizeSegment(category)

  if (normalizedPath) {
    paths.add(normalizedPath)
  } else if (normalizedCategory && normalizedSlug) {
    paths.add(`/${normalizedCategory}/${normalizedSlug}`)
  } else if (normalizedSlug) {
    paths.add(`/${normalizedSlug}`)
  }

  return [...paths]
}
