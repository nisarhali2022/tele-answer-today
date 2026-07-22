import { getContentIndex } from './cms'
import { EXCLUDED_CONTENT_SLUGS, SITE_CONFIG } from './constants'
import { getKarachiSeoDayStartISO } from './date'

const CANONICAL_FIXED_PAGE_PATHS = new Map([
  ['/about', '/about-us'],
  ['/contact', '/contact-us'],
  ['/privacy', '/privacy-policy'],
])

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const NON_INDEXABLE_STATUSES = new Set([
  'draft',
  'pending',
  'private',
  'trash',
  'deleted',
  'archived',
  'redirect',
])

function toSitemapItem(path, updatedAt = null, image = null) {
  const canonicalPath = normalizeSitemapPagePath(path)
  if (!canonicalPath) return null

  return {
    loc: `${SITE_CONFIG.siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`,
    lastmod: updatedAt || null,
    images: image?.url ? [normalizeSitemapImageUrl(image.url)].filter(Boolean) : [],
  }
}

export function normalizeSitemapPagePath(path) {
  const rawPath = String(path || '').trim()
  if (
    !rawPath ||
    rawPath.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(rawPath) ||
    /[?#]/.test(rawPath)
  ) {
    return null
  }

  const normalized = `/${rawPath.replace(/^\/+|\/+$/g, '')}`
  return normalized === '/'
    ? '/'
    : CANONICAL_FIXED_PAGE_PATHS.get(normalized) || normalized
}

export function isSitemapEligible(item) {
  if (!item || item.sitemapInclude === false) return false

  const status = String(item.status || item.publishStatus || '').toLowerCase()
  if (NON_INDEXABLE_STATUSES.has(status)) return false

  const robots = item.robotsMeta || item.robots || item.seo?.robotsMeta || item.seo?.robots
  if (robotsRequestNoindex(robots) || item.noindex === true || item.noindex === 'true') {
    return false
  }

  return !(
    item.isRedirect === true ||
    item.redirectTo ||
    item.redirectUrl ||
    item.redirectDestination
  )
}

function robotsRequestNoindex(robots) {
  if (!robots) return false
  if (typeof robots === 'object') return robots.index === false || robots.noindex === true
  return String(robots).toLowerCase().includes('noindex')
}

function normalizeSitemapImageUrl(value) {
  try {
    const url = new URL(String(value || ''))
    const hostname = url.hostname.toLowerCase()
    const isLegacyHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === 'wp.teleanswertoday.pk' ||
      hostname.endsWith('.hostingerapp.com') ||
      hostname.includes('hostinger') ||
      hostname === 'telenorquiztoday.com.pk' ||
      hostname === 'www.telenorquiztoday.com.pk'

    if (
      url.protocol !== 'https:' ||
      isLegacyHost ||
      url.pathname.startsWith('/_next/image')
    ) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function dedupeSitemapItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.loc || seen.has(item.loc)) return false
    seen.add(item.loc)
    return true
  })
}

export async function getSitemapPosts() {
  const index = await getContentIndex()
  return buildSitemapPosts(index.posts)
}

export async function getSitemapPages() {
  const index = await getContentIndex()
  return buildSitemapPages(index)
}

export async function getSitemapCategories() {
  const index = await getContentIndex()
  return buildSitemapCategories(index.categories)
}

export function buildSitemapPosts(posts = []) {
  const excludedSlugs = new Set(EXCLUDED_CONTENT_SLUGS)
  const items = Array.isArray(posts) ? posts : []

  return dedupeSitemapItems(
    items
      .filter((post) => (
        isSitemapEligible(post) &&
        post.slug &&
        post.categorySlug &&
        !excludedSlugs.has(post.slug)
      ))
      .map((post) => toSitemapItem(
        `/${post.categorySlug}/${post.slug}`,
        post.updatedAt,
        post.image
      ))
      .filter(Boolean)
  )
}

export function buildSitemapPages(index = {}) {
  const templates = (Array.isArray(index.templates) ? index.templates : [])
    .filter((item) => isSitemapEligible(item) && item.path)
    .map((item) => {
      const path = normalizeSitemapPagePath(item.path)
      return toSitemapItem(
        path,
        path === '/' ? getKarachiSeoDayStartISO() : item.updatedAt,
        item.image
      )
    })
  const pages = (Array.isArray(index.pages) ? index.pages : [])
    .filter((item) => isSitemapEligible(item) && item.path)
    .map((item) => toSitemapItem(item.path, item.updatedAt, item.image))
  const authors = (Array.isArray(index.authors) ? index.authors : [])
    .filter((item) => isSitemapEligible(item) && item.path)
    .map((item) => toSitemapItem(item.path))

  return dedupeSitemapItems([...templates, ...pages, ...authors].filter(Boolean))
}

export function buildSitemapCategories(categories = []) {
  const items = Array.isArray(categories) ? categories : []
  return dedupeSitemapItems(
    items
      .filter((item) => isSitemapEligible(item) && item.path)
      .map((item) => toSitemapItem(item.path))
      .filter(Boolean)
  )
}

export function getLatestLastModified(items) {
  return items
    .map((item) => item.lastmod)
    .filter(Boolean)
    .sort((left, right) => new Date(right) - new Date(left))[0]
}

function renderLastModified(lastmod) {
  const date = lastmod ? new Date(lastmod) : null
  return date && !Number.isNaN(date.getTime())
    ? `<lastmod>${date.toISOString()}</lastmod>`
    : ''
}

export function renderUrlSitemap(items) {
  const urls = (items || []).filter((item) => isCanonicalSitemapUrl(item?.loc)).map((item) => {
    const images = (item.images || [])
      .map(normalizeSitemapImageUrl)
      .filter(Boolean)
      .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
      .join('')
    return `<url><loc>${escapeXml(item.loc)}</loc>${renderLastModified(item.lastmod)}${images}</url>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`
}

export function renderSitemapIndex(items) {
  const sitemaps = (items || [])
    .filter((item) => isCanonicalSitemapUrl(item?.loc))
    .map((item) => `<sitemap><loc>${escapeXml(item.loc)}</loc>${renderLastModified(item.lastmod)}</sitemap>`)
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`
}

function isCanonicalSitemapUrl(value) {
  try {
    const url = new URL(String(value || ''))
    return (
      url.origin === SITE_CONFIG.siteUrl &&
      url.protocol === 'https:' &&
      !url.search &&
      !url.hash &&
      (url.pathname === '/' || !url.pathname.endsWith('/'))
    )
  } catch {
    return false
  }
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
