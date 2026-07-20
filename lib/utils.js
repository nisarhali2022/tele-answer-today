import { CATEGORY_COLORS, SITE_CONFIG } from './constants'

const LEGACY_PUBLIC_ORIGINS = [
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

export function calculateReadingTime(htmlContent) {
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

  return normalized
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

export function getExcerpt(post, maxLength = 120) {
  const excerpt = post?.excerpt || post?.content || ''
  return truncateText(excerpt, maxLength)
}

export function getFeaturedImageUrl(post, preferredSize = 'large') {
  return post?.featuredImage?.url || null
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

function isLegacyPublicOrigin(origin) {
  return LEGACY_PUBLIC_ORIGINS.some(
    (legacyOrigin) => origin.toLowerCase() === legacyOrigin.toLowerCase()
  )
}
