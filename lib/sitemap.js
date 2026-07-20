import { getContentIndex } from './cms'
import { SITE_CONFIG } from './constants'
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

function toSitemapItem(path, updatedAt = null, image = null) {
  return {
    loc: `${SITE_CONFIG.siteUrl}${path === '/' ? '' : path}`,
    lastmod: updatedAt || null,
    images: image?.url ? [image.url] : [],
  }
}

export function normalizeSitemapPagePath(path) {
  const normalized = `/${String(path || '').replace(/^\/+|\/+$/g, '')}`
  return normalized === '/'
    ? '/'
    : CANONICAL_FIXED_PAGE_PATHS.get(normalized) || normalized
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
  return dedupeSitemapItems(
    (index.posts || [])
      .filter((post) => post.sitemapInclude !== false && post.slug && post.categorySlug)
      .map((post) => toSitemapItem(
        `/${post.categorySlug}/${post.slug}`,
        post.updatedAt,
        post.image
      ))
  )
}

export async function getSitemapPages() {
  const index = await getContentIndex()
  const templates = (index.templates || [])
    .filter((item) => item.sitemapInclude !== false && item.path)
    .map((item) => ({ ...item, path: normalizeSitemapPagePath(item.path) }))
    .map((item) => toSitemapItem(
      item.path,
      item.path === '/' ? getKarachiSeoDayStartISO() : item.updatedAt,
      item.image
    ))
  const pages = (index.pages || [])
    .filter((item) => item.sitemapInclude !== false && item.path)
    .map((item) => ({ ...item, path: normalizeSitemapPagePath(item.path) }))
    .map((item) => toSitemapItem(item.path, item.updatedAt, item.image))
  const authors = (index.authors || [])
    .filter((item) => item.path)
    .map((item) => toSitemapItem(item.path))

  return dedupeSitemapItems([...templates, ...pages, ...authors])
}

export async function getSitemapCategories() {
  const index = await getContentIndex()
  return (index.categories || [])
    .filter((item) => item.path)
    .map((item) => toSitemapItem(item.path))
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
  const urls = items.map((item) => {
    const images = (item.images || [])
      .filter((image) => !String(image).includes('/_next/image'))
      .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
      .join('')
    return `<url><loc>${escapeXml(item.loc)}</loc>${renderLastModified(item.lastmod)}${images}</url>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`
}

export function renderSitemapIndex(items) {
  const sitemaps = items
    .map((item) => `<sitemap><loc>${escapeXml(item.loc)}</loc>${renderLastModified(item.lastmod)}</sitemap>`)
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
