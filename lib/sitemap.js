import { EXCLUDED_CONTENT_SLUGS, LEGACY_HOME_REDIRECT_SLUGS, SITE_CONFIG } from './constants'
import { WORDPRESS_API_URL } from './wordpressConfig'
import { getKarachiSeoDayStartISO } from './date'
import { wordpressJson } from './wordpress'

const API = WORDPRESS_API_URL
const REVALIDATE = SITE_CONFIG.revalidateTime

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function absoluteUrl(path = '') {
  const normalizedPath = path ? `/${path.replace(/^\/|\/$/g, '')}` : '/'
  return `${SITE_CONFIG.siteUrl}${normalizedPath}`
}

function getPostCategories(post) {
  const terms = post?._embedded?.['wp:term'] || []
  return terms.flat().filter((term) => term.taxonomy === 'category')
}

function extractPostImages(post) {
  const images = new Set()
  const featuredImage =
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url

  if (featuredImage) images.add(featuredImage)

  const content = post?.content?.rendered || ''
  for (const match of content.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const directSource = tag.match(
      /\b(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i
    )?.[1]
    if (directSource && !directSource.startsWith('data:')) {
      images.add(directSource)
    }

    const srcset = tag.match(/\b(?:srcset|data-srcset)=["']([^"']+)["']/i)?.[1]
    if (srcset) {
      const candidates = srcset
        .split(',')
        .map((candidate) => candidate.trim().split(/\s+/))
        .filter(([url]) => url && !url.startsWith('data:'))
        .sort((a, b) => Number.parseInt(b[1], 10) - Number.parseInt(a[1], 10))
      if (candidates[0]?.[0]) images.add(candidates[0][0])
    }
  }

  return [...images]
}

function getLastModified(item) {
  if (item?.modified_gmt) return `${item.modified_gmt.replace(/Z$/, '')}Z`
  return item?.modified || null
}

async function fetchAll(endpoint, fields = '') {
  const items = []
  let page = 1

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?'
    const fieldsQuery = fields ? `&_fields=${encodeURIComponent(fields)}` : ''
    const url =
      `${API}/${endpoint}${separator}per_page=100&page=${page}${fieldsQuery}`
    const { data: pageItems, response } = await wordpressJson(
      url,
      { next: { revalidate: REVALIDATE } },
      `Build sitemap from ${endpoint} page ${page}`
    )
    if (!pageItems.length) break

    items.push(...pageItems)

    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1)
    if (page >= totalPages) break
    page += 1
  }

  return items
}

export async function getSitemapPosts() {
  const posts = await fetchAll(
    'posts?_embed=wp:featuredmedia,wp:term',
    'id,slug,modified,modified_gmt,content,_links,_embedded'
  )

  return posts
    .filter((post) => !EXCLUDED_CONTENT_SLUGS.includes(post.slug))
    .map((post) => {
      const category = getPostCategories(post)[0]
      if (!category?.slug || !post.slug) return null

      return {
        loc: absoluteUrl(`${category.slug}/${post.slug}`),
        lastmod: getLastModified(post),
        images: extractPostImages(post),
        categoryIds: getPostCategories(post).map((item) => item.id),
      }
    })
    .filter(Boolean)
}

export async function getSitemapPages() {
  const [pages, authors] = await Promise.all([
    fetchAll(
      'pages?_embed=wp:featuredmedia',
      'id,slug,modified,modified_gmt,content,_links,_embedded'
    ),
    fetchAll('users', 'id,slug'),
  ])

  return [
    {
      loc: absoluteUrl(),
      lastmod: getKarachiSeoDayStartISO(),
      images: [],
    },
    ...pages
      .filter(
        (page) =>
          page.slug &&
          page.slug !== 'blog' &&
          page.slug !== 'about' &&
          page.slug !== 'contact' &&
          page.slug !== 'editorial-policy' &&
          page.slug !== 'corrections-policy' &&
          !LEGACY_HOME_REDIRECT_SLUGS.includes(page.slug)
      )
      .map((page) => ({
        loc: absoluteUrl(page.slug),
        lastmod: getLastModified(page),
        images: extractPostImages(page),
      })),
    {
      loc: absoluteUrl('editorial-policy'),
      lastmod: null,
      images: [],
    },
    {
      loc: absoluteUrl('corrections-policy'),
      lastmod: null,
      images: [],
    },
    ...authors
      .filter((author) => author.slug)
      .map((author) => ({
        loc: absoluteUrl(`author/${author.slug}`),
        lastmod: null,
        images: [],
      })),
  ]
}

export async function getSitemapCategories(posts = null) {
  const [categories, sitemapPosts] = await Promise.all([
    fetchAll('categories?exclude=1', 'id,slug'),
    posts ? Promise.resolve(posts) : getSitemapPosts(),
  ])

  return categories.map((category) => {
    const categoryPosts = sitemapPosts.filter((post) =>
      post.categoryIds.includes(category.id)
    )
    const latestPost = categoryPosts
      .filter((post) => post.lastmod)
      .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod))[0]

    return {
      loc: absoluteUrl(category.slug),
      lastmod: latestPost?.lastmod,
      images: [],
    }
  })
}

export function getLatestLastModified(items) {
  return items
    .map((item) => item.lastmod)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0]
}

function renderLastModified(lastmod) {
  if (!lastmod) return ''
  const parsed = new Date(lastmod)
  if (Number.isNaN(parsed.getTime())) return ''
  return `<lastmod>${parsed.toISOString()}</lastmod>`
}

export function renderUrlSitemap(items) {
  const urls = items
    .map((item) => {
      const images = (item.images || [])
        .map(
          (image) =>
            `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`
        )
        .join('')

      return `<url><loc>${escapeXml(item.loc)}</loc>${renderLastModified(
        item.lastmod
      )}${images}</url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`
}

export function renderSitemapIndex(items) {
  const sitemaps = items
    .map(
      (item) =>
        `<sitemap><loc>${escapeXml(item.loc)}</loc>${renderLastModified(
          item.lastmod
        )}</sitemap>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`
}

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${REVALIDATE}, stale-while-revalidate=86400`,
    },
  })
}
