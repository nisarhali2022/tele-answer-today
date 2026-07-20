import { homeAnchorId } from './homeAnchors'
import {
  optimizeContentImages,
  rewritePublicContentReferences,
  wrapContentTables,
} from './utils'

const HEADING_PATTERN = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi
const ALL_HEADING_PATTERN = /<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/gi
const ID_ATTRIBUTE_PATTERN = /\bid\s*=\s*(["'])(.*?)\1/i
const LEADING_LATEST_NEWS_HEADING_PATTERN = /^(?:\s|<p\b[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>)*<h([1-6])\b[^>]*>\s*Latest\s+News\s*<\/h\1>/i

function headingText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function uniqueId(baseId, usedIds) {
  const base = baseId || 'section'
  let candidate = base
  let suffix = 2

  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  usedIds.add(candidate)
  return candidate
}

export function formatHomeTemplate(value, dateLabel) {
  return String(value || '').replace(/\{date\}/gi, dateLabel)
}

/** Keep the CMS home body valid even when an editor omits or duplicates its H1. */
export function ensureSingleHomeH1(value, fallbackHeading) {
  let h1Count = 0
  const html = String(value || '').replace(
    /<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi,
    (fullMatch, attributes, innerHtml) => {
      h1Count += 1
      if (h1Count === 1) return fullMatch
      return `<h2${attributes}>${innerHtml}</h2>`
    }
  )

  return h1Count > 0
    ? html
    : `<h1>${escapeHtml(fallbackHeading)}</h1>${html}`
}

export function splitHomeContentAtQuizHeading(value) {
  const html = String(value || '')
  const headingPattern = new RegExp(ALL_HEADING_PATTERN.source, 'gi')
  let match = null

  for (const candidate of html.matchAll(headingPattern)) {
    const text = headingText(candidate[0])
    if (/^Today\s+Telenor\s+Answer(?:\s|$)/i.test(text)) {
      match = candidate
      break
    }
  }

  if (!match || match.index === undefined) {
    return { beforeHtml: html, quizHeadingHtml: '', afterHtml: '' }
  }

  const headingStart = match.index
  const headingEnd = headingStart + match[0].length
  return {
    beforeHtml: html.slice(0, headingStart),
    quizHeadingHtml: match[0],
    afterHtml: html.slice(headingEnd),
  }
}

/** Adds TOC anchors to CMS headings while preserving their visible content. */
export function prepareHomeContent(value, usedIds = new Set()) {
  const headings = []
  const normalizedHtml = wrapContentTables(
    optimizeContentImages(rewritePublicContentReferences(value || ''))
  )

  const html = normalizedHtml.replace(
    HEADING_PATTERN,
    (fullMatch, level, attributes, innerHtml) => {
      const text = headingText(innerHtml)
      if (!text) return fullMatch

      const requestedId = String(attributes || '').match(ID_ATTRIBUTE_PATTERN)?.[2]
      const id = uniqueId(requestedId || homeAnchorId(text), usedIds)
      const attributesWithId = requestedId
        ? String(attributes).replace(ID_ATTRIBUTE_PATTERN, `id="${id}"`)
        : `${attributes} id="${id}"`

      headings.push({ id, level: Number(level), text })
      return `<h${level}${attributesWithId}>${innerHtml}</h${level}>`
    }
  )

  return { headings, html }
}

/** The public Latest News cards replace an editor-authored duplicate heading. */
export function removeInitialDuplicateLatestNews(value) {
  const html = String(value || '')
  const match = html.match(LEADING_LATEST_NEWS_HEADING_PATTERN)
  return match ? html.slice(match[0].length) : html
}

/** Remove the homepage FAQ section from CMS-authored content. */
export function removeHomeFaqSection(value) {
  const html = String(value || '')
  const headingPattern = new RegExp(ALL_HEADING_PATTERN.source, 'gi')
  let match = null

  for (const candidate of html.matchAll(headingPattern)) {
    const text = headingText(candidate[0])
    if (/^FAQs?\s*(?:[-–—]|&ndash;|&#8211;|&#x2013;)?\s*My\s+Telenor\s+Answers\s+Today$/i.test(text)) {
      match = candidate
      break
    }
  }

  if (!match || match.index === undefined) return html

  const faqLevel = Number(match[1])
  const faqEnd = match.index + match[0].length
  const nextHeading = html.slice(faqEnd).search(new RegExp(`<h[1-${faqLevel}]\\b`, 'i'))

  if (nextHeading === -1) return html.slice(0, match.index)

  return html.slice(0, match.index) + html.slice(faqEnd + nextHeading)
}
