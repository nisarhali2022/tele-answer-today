import { SITE_CONFIG } from './constants'
import { toPlainText } from './utils'

const CATEGORY_DESCRIPTIONS = {
  telenor:
    'Telenor Pakistan news, service updates, packages, app guides, and practical information for mobile users.',
  telecom:
    'Telecom industry news, mobile network updates, consumer guidance, and regulatory developments.',
  global:
    'Important global news and developments in technology, media, business, and digital services.',
  tech:
    'Technology news, product updates, digital trends, and practical guides for everyday users.',
  jazz:
    'Jazz Pakistan news, packages, service updates, and useful information for mobile subscribers.',
}

export function canonicalPath(path = '/', page = 1, query = {}) {
  const normalizedPath =
    path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}`
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      params.set(key, String(value))
    }
  })

  if (page > 1) params.set('page', String(page))

  const queryString = params.toString()
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath
}

export function absoluteUrl(path = '/', page = 1, query = {}) {
  return `${SITE_CONFIG.siteUrl}${canonicalPath(path, page, query)}`
}

export function parsePageNumber(value) {
  if (value === undefined || value === null || value === '') return 1
  const raw = Array.isArray(value) ? value[0] : value
  if (!/^[1-9]\d*$/.test(String(raw))) return null

  const page = Number(raw)
  return Number.isSafeInteger(page) ? page : null
}

export function isInvalidArchivePage(result, currentPage) {
  return (
    result?.invalidPage === true ||
    (currentPage > 1 && (!result?.totalPages || currentPage > result.totalPages))
  )
}

export function getCategoryDescription(category) {
  const supplied = toPlainText(category?.description || '').trim()
  if (supplied) return supplied

  return (
    CATEGORY_DESCRIPTIONS[category?.slug] ||
    `Browse ${category?.name || 'category'} news, updates, and practical guides from ${SITE_CONFIG.name}.`
  )
}

export function getTagDescription(tag) {
  const supplied = toPlainText(tag?.description || '').trim()
  if (supplied) return supplied
  return `Browse articles and updates related to ${tag?.name || 'this topic'}.`
}

export function buildMetadata({
  title,
  description,
  path = '/',
  page = 1,
  query,
  type = 'website',
  image = `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultOgImage}`,
  publishedTime,
  modifiedTime,
  robots,
  absoluteTitle = false,
}) {
  const canonical = absoluteUrl(path, page, query)
  const cleanTitle = toPlainText(title)
  const cleanDescription = toPlainText(description)
  const resolvedTitle = absoluteTitle ? { absolute: cleanTitle } : cleanTitle

  return {
    title: resolvedTitle,
    description: cleanDescription,
    alternates: { canonical },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: canonical,
      siteName: SITE_CONFIG.name,
      type,
      images: [{ url: image }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDescription,
      images: [image],
    },
    ...(robots && { robots }),
  }
}
