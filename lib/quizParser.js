import { decodeHtmlEntities, stripHtml } from './utils.js'
import { getKarachiDateISO, getKarachiDateLabel } from './date.js'

export function getTodayKarachi() {
  return getKarachiDateISO()
}

export function getTodayLabelKarachi() {
  return getKarachiDateLabel()
}

export function parseQuizTables(html) {
  if (!html) return []

  const tableQuestions = parseTableQuestions(html)
  if (tableQuestions.length > 0) return tableQuestions

  return parseNumberedQuestions(html)
}

export function parseFaqs(html) {
  if (!html) return []

  const faqs = []
  for (const match of html.matchAll(
    /<h[2-4][^>]*>\s*(?:<[^>]+>)*\s*(?:Q\s*:)?\s*(.+?\?)\s*(?:<[^>]+>)*\s*<\/h[2-4]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi
  )) {
    const question = cleanText(match[1])
    const answer = cleanText(match[2])
    if (question && answer) faqs.push({ q: question, a: answer })
  }

  if (faqs.length > 0) return faqs

  const text = htmlToLines(html).join('\n')
  const qMatches = [...text.matchAll(/Q:\s*(.+?)\s*(?=A:|$)/gs)]
  const aMatches = [...text.matchAll(/A:\s*(.+?)\s*(?=Q:|$)/gs)]

  for (let i = 0; i < Math.min(qMatches.length, aMatches.length); i += 1) {
    faqs.push({ q: qMatches[i][1].trim(), a: aMatches[i][1].trim() })
  }

  return faqs
}

function parseTableQuestions(html) {
  const questions = []
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || []

  for (const table of tables) {
    const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(
      (match) => cleanText(match[1])
    )

    let question = ''
    const options = []
    let answer = ''

    for (const row of rows) {
      const questionMatch = row.match(/^Question\s*\d+\s*[:\-–—]?\s*(.+)$/i)
      const answerMatch = row.match(/^Answer\s*(?:👉|->|=>|:)?\s*(.+)$/i)

      if (questionMatch) {
        question = questionMatch[1].trim()
      } else if (answerMatch) {
        answer = answerMatch[1].trim()
      } else if (row && !/^answer/i.test(row)) {
        options.push(row.replace(/^[-–—]\s*/, '').trim())
      }
    }

    if (question && answer) {
      questions.push({ question, options: options.slice(0, 4), answer })
    }
  }

  return questions
}

function parseNumberedQuestions(html) {
  const lines = htmlToLines(html)
  const questions = []

  for (let index = 0; index < lines.length; index += 1) {
    const questionMatch = lines[index].match(/^(\d+)\.\s*(.+)$/)
    if (!questionMatch) continue

    const question = questionMatch[2].trim()
    const options = []
    let answer = ''

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor]
      if (/^\d+\.\s+/.test(line)) {
        index = cursor - 1
        break
      }

      const answerMatch = line.match(/^Answer\s*(?:👉|->|=>|:)?\s*(.+)$/i)
      if (answerMatch) {
        answer = answerMatch[1].trim()
        index = cursor
        break
      }

      if (isPotentialOption(line)) options.push(line.replace(/^[-–—]\s*/, ''))
    }

    if (question && answer) {
      questions.push({ question, options: options.slice(0, 4), answer })
    }
  }

  return questions
}

function isPotentialOption(line) {
  if (!line) return false
  return ![
    /^today telenor answer/i,
    /^latest news$/i,
    /^faqs?$/i,
    /^frequently asked/i,
    /^conclusion$/i,
  ].some((pattern) => pattern.test(line))
}

function htmlToLines(html) {
  return decodeHtmlEntities(
    String(html)
      .replace(/<\/(?:p|h[1-6]|li|tr|td|div|table)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function cleanText(value) {
  return decodeHtmlEntities(stripHtml(String(value || '')))
    .replace(/\s+/g, ' ')
    .trim()
}
