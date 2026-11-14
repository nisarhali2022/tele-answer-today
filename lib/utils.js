import { CATEGORY_COLORS, SITE_CONFIG } from './constants'

const LEGACY_PUBLIC_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  'https://127.0.0.1:3000',
  'localhost:3000',
  '127.0.0.1:3000',
  'https://wp.teleanswertoday.pk',
  'http://wp.teleanswertoday.pk',
  'https://www.teleanswertoday.pk',
  'http://www.teleanswertoday.pk',
  'http://teleanswertoday.pk',
  'https://telenorquiztoday.com.pk',
  'http://telenorquiztoday.com.pk',
  'https://www.telenorquiztoday.com.pk',
  'http://www.telenorquiztoday.com.pk',
]

export function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return new Intl.DateTimeFormat('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

export function calculateReadingTime(htmlContent, suppliedMinutes = null) {
  const publishedMinutes = Number(suppliedMinutes)
  if (Number.isFinite(publishedMinutes) && publishedMinutes > 0) {
    return `${Math.max(1, Math.ceil(publishedMinutes))} min read`
  }

  if (!htmlContent) return '1 min read'
  const text = htmlContent.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / 200)
  return `${Math.max(1, minutes)} min read`
}

export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function removeContentH1Blocks(html) {
  if (!html) return ''

  return String(html)
    .replace(
      /<!--\s*wp:heading\s+\{[^}]*"level"\s*:\s*1[^}]*\}\s*-->\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*<!--\s*\/wp:heading\s*-->/gi,
      ''
    )
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '')
}

export function prepareContent(html) {
  return wrapContentTables(
    optimizeContentImages(
      rewritePublicContentReferences(removeContentH1Blocks(html || ''))
    )
  )
}

export function wrapContentTables(html) {
  if (!html) return ''

  return String(html).replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (table, offset, fullHtml) => {
      const before = fullHtml.slice(Math.max(0, offset - 160), offset)
      if (/<div\b[^>]*class=["'][^"']*\bwp-table-scroll\b[^"']*["'][^>]*>\s*$/i.test(before)) {
        return table
      }

      return `<div class="wp-table-scroll">${table}</div>`
    }
  )
}

export const normalizeContentLinks = rewritePublicContentReferences

export function rewritePublicContentReferences(value) {
  if (!value) return ''

  let normalized = String(value).replace(
    /info@wp\.teleanswertoday\.pk/gi,
    'info@teleanswertoday.pk'
  )

  for (const origin of LEGACY_PUBLIC_ORIGINS) {
    normalized = normalized.replace(
      createPublicOriginRegExp(origin),
      SITE_CONFIG.siteUrl
    )
  }

  normalized = normalized.replace(
    /https?:\/\/(?:[a-z\d-]+\.)*(?:hostingerapp\.com|hostingersite\.com)(?=\/|["'\s<]|$)/gi,
    SITE_CONFIG.siteUrl
  )

  return normalizeCanonicalPublicUrls(normalizeRelativeLinkPaths(normalized))
}

export function decodeHtmlEntities(text) {
  if (!text) return ''

  const decodeCodePoint = (value, radix, fallback) => {
    const codePoint = Number.parseInt(value, radix)
    return Number.isInteger(codePoint) &&
      codePoint >= 0 &&
      codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : fallback
  }
  const namedEntities = {
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    hellip: '…',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
  }

  return String(text)
    .replace(/&#x([0-9a-f]+);/gi, (entity, value) =>
      decodeCodePoint(value, 16, entity)
    )
    .replace(/&#([0-9]+);/g, (entity, value) =>
      decodeCodePoint(value, 10, entity)
    )
    .replace(
      /&(nbsp|ndash|mdash|hellip|lsquo|rsquo|ldquo|rdquo);/gi,
      (_, name) => namedEntities[name.toLowerCase()]
    )
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
}

export function toPlainText(value) {
  return stripHtml(decodeHtmlEntities(String(value || '')))
}

export function truncateText(text, maxLength = 120) {
  if (!text) return ''
  const clean = toPlainText(text)
  if (clean.length <= maxLength) return clean
  return clean.slice(0, maxLength).trim() + '…'
}

export function getCategoryColor(slug) {
  if (!slug) return CATEGORY_COLORS[0]
  const sum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return CATEGORY_COLORS[sum % CATEGORY_COLORS.length]
}

export function injectAdAfterFirstParagraph(htmlContent, adHtml) {
  if (!htmlContent || !adHtml) return htmlContent
  const firstPEnd = htmlContent.indexOf('</p>')
  if (firstPEnd === -1) return htmlContent
  return (
    htmlContent.slice(0, firstPEnd + 4) +
    adHtml +
    htmlContent.slice(firstPEnd + 4)
  )
}

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr',
])

// Returns the end offset of every non-empty <p> that sits at the top level of
// the HTML (not inside a list, table, details, div, ...). Splitting there keeps
// each resulting chunk well-formed.
function findTopLevelParagraphEnds(html) {
  const ends = []
  const tagPattern = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g
  let depth = 0
  let paragraphStart = -1

  for (const match of html.matchAll(tagPattern)) {
    if (match[0].startsWith('<!--')) continue
    const isClosing = match[1] === '/'
    const name = match[2].toLowerCase()

    if (isClosing) {
      depth = Math.max(0, depth - 1)
      if (name === 'p' && depth === 0 && paragraphStart >= 0) {
        const end = match.index + match[0].length
        if (toPlainText(html.slice(paragraphStart, end)).length > 0) ends.push(end)
        paragraphStart = -1
      }
      continue
    }

    if (match[3] === '/' || VOID_HTML_TAGS.has(name)) continue
    if (name === 'p' && depth === 0) paragraphStart = match.index
    depth++
  }

  return ends
}

// Splits HTML into chunks with an ad slot after every `every` top-level
// paragraphs, at most `max` slots, and never after the final paragraph.
// Render an ad between consecutive chunks.
export function splitContentForAds(htmlContent, { every = 3, max = 4 } = {}) {
  const html = String(htmlContent || '')
  if (!html || every < 1 || max < 1) return [html]

  const ends = findTopLevelParagraphEnds(html)
  const cutPoints = []
  for (let index = every - 1; index < ends.length - 1 && cutPoints.length < max; index += every) {
    cutPoints.push(ends[index])
  }

  const chunks = []
  let start = 0
  for (const cut of cutPoints) {
    chunks.push(html.slice(start, cut))
    start = cut
  }
  chunks.push(html.slice(start))
  return chunks
}

// Quiz image ads go after questions 1, 3, 5, ... but never after the last
// question (the ad below the quiz already follows it). `index` is 0-based.
export function hasAdAfterQuestion(index, total) {
  return index % 2 === 0 && index < total - 1
}

export function getExcerpt(post, maxLength = 120) {
  const excerpt = post?.excerpt || post?.content || ''
  return truncateText(excerpt, maxLength)
}

const FEATURED_IMAGE_VARIANT_ALIASES = {
  thumbnail: 'thumbnail',
  card: 'card',
  medium_large: 'card',
  mobile: 'mobile',
}

export function getFeaturedImageUrl(post, preferredSize = 'large') {
  const image = post?.featuredImage
  if (!image?.url) return null

  const variantName = FEATURED_IMAGE_VARIANT_ALIASES[preferredSize]
  return variantName && image.variants?.[variantName]?.url
    ? image.variants[variantName].url
    : image.url
}

export function getFeaturedImageDimensions(post, preferredSize = 'large') {
  const image = post?.featuredImage
  if (!image?.url) return { width: 800, height: 450 }

  const variantName = FEATURED_IMAGE_VARIANT_ALIASES[preferredSize]
  const selected = variantName ? image.variants?.[variantName] : null
  return {
    width: Number(selected?.width || image.width || 800),
    height: Number(selected?.height || image.height || 450),
  }
}

export function getFeaturedImageAlt(post) {
  return toPlainText(
    post?.featuredImage?.alt ||
    post?.title ||
    ''
  )
}

export function getPostAuthor(post) {
  return post?.author || null
}

export function getPostCategories(post) {
  return post?.category ? [post.category] : []
}

export function getFirstCategory(post) {
  const cats = getPostCategories(post)
  return cats[0] || null
}

export function getAuthorPath(author) {
  const slug = author?.slug || String(author?.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug ? `/author/${slug}` : '/about-us'
}

export function optimizeContentImages(html = '') {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let optimized = tag
    const source =
      getHtmlAttribute(optimized, 'src') ||
      getHtmlAttribute(optimized, 'data-src') ||
      ''
    const existingSrcset =
      getHtmlAttribute(optimized, 'srcset') ||
      getHtmlAttribute(optimized, 'data-srcset')
    const dimensions = getImageDimensions(optimized, source, existingSrcset)

    if (!/\bloading\s*=/i.test(optimized)) {
      optimized = optimized.replace('<img', '<img loading="lazy"')
    }
    if (!/\bdecoding\s*=/i.test(optimized)) {
      optimized = optimized.replace('<img', '<img decoding="async"')
    }
    if (!/\bwidth\s*=/i.test(optimized)) {
      optimized = optimized.replace(
        '<img',
        `<img width="${dimensions.width}"`
      )
    }
    if (!/\bheight\s*=/i.test(optimized)) {
      optimized = optimized.replace(
        '<img',
        `<img height="${dimensions.height}"`
      )
    }
    if (!/\bsizes\s*=/i.test(optimized)) {
      optimized = optimized.replace(
        '<img',
        '<img sizes="(max-width: 768px) 100vw, 768px"'
      )
    }
    return optimized
  })
}

function setHtmlAttribute(tag, name, value) {
  const attrPattern = new RegExp(`\\b${name}\\s*=\\s*["'][^"']*["']`, 'i')
  if (attrPattern.test(tag)) {
    return tag.replace(attrPattern, `${name}="${value}"`)
  }

  return tag.replace('<img', `<img ${name}="${value}"`)
}

function getHtmlAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i')
  )
  return match?.[1] || ''
}

function getImageDimensions(tag, source, srcset) {
  const width = Number.parseInt(getHtmlAttribute(tag, 'width'), 10)
  const height = Number.parseInt(getHtmlAttribute(tag, 'height'), 10)
  if (width > 0 && height > 0) return { width, height }

  const candidates = [source, ...(srcset || '').split(',')]
  for (const candidate of candidates) {
    const match = candidate.match(
      /-(\d+)x(\d+)(?=\.[a-z0-9]+(?:[?\s]|$))/i
    )
    if (match) {
      return {
        width: Number.parseInt(match[1], 10),
        height: Number.parseInt(match[2], 10),
      }
    }
  }

  return { width: 800, height: 450 }
}

function createPublicOriginRegExp(value, pathPattern = '\\/') {
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `${escaped}(?=${pathPattern}|["'\\s<]|$)`,
    'gi'
  )
}

function normalizeCanonicalPublicUrls(value) {
  return String(value).replace(
    /https?:\/\/(?:www\.)?teleanswertoday\.pk(?:\/[^\s"'<>]*)?/gi,
    (url) => {
      try {
        const parsed = new URL(url)
        const pathname = parsed.pathname === '/'
          ? ''
          : parsed.pathname.replace(/\/+$/, '')
        return `${SITE_CONFIG.siteUrl}${pathname}${parsed.search}${parsed.hash}`
      } catch {
        return url
      }
    }
  )
}

function normalizeRelativeLinkPaths(value) {
  return String(value).replace(
    /(\bhref\s*=\s*["'])(\/[^"'?#\s]*)([?#][^"']*)?(["'])/gi,
    (_, prefix, pathname, suffix = '', quote) => {
      const normalizedPath = pathname === '/'
        ? '/'
        : pathname.replace(/\/+$/, '') || '/'
      return `${prefix}${normalizedPath}${suffix}${quote}`
    }
  )
}

function isLegacyPublicOrigin(origin) {
  return LEGACY_PUBLIC_ORIGINS.some(
    (legacyOrigin) => origin.toLowerCase() === legacyOrigin.toLowerCase()
  )
}
