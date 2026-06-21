import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { hasAdminSession } from '@/lib/adminAuth'
import { HOME_PAGE_SLUG } from '@/lib/constants'
import { getKarachiDateISO, getKarachiDateLabel } from '@/lib/date'
import { formatQuizContent, normalizeQuizQuestions } from '@/lib/quiz'
import { parseQuizTables } from '@/lib/quizParser'
import { WORDPRESS_API_URL } from '@/lib/wordpressConfig'

const WP_API_URL = WORDPRESS_API_URL
const WP_USER = process.env.WP_ADMIN_USER
const WP_PASS = process.env.WP_ADMIN_PASS
const WORDPRESS_RETRY_DELAY_MS = 250

class QuizWordPressError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause })
    this.name = 'QuizWordPressError'
    this.status = status
  }
}

function createAuthHeader(user, pass) {
  const credentials = Buffer.from(`${user}:${pass}`).toString('base64')
  return `Basic ${credentials}`
}

function shouldRetryWordPress(status) {
  return !status || status === 429 || status >= 500
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getMainQuizPage() {
  const url = `${WP_API_URL}/pages?slug=${encodeURIComponent(HOME_PAGE_SLUG)}&per_page=1`
  let lastError

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new QuizWordPressError(
          `WordPress quiz page lookup failed with status ${response.status}.`,
          { status: response.status }
        )
      }

      let pages
      try {
        pages = await response.json()
      } catch (error) {
        throw new QuizWordPressError(
          'WordPress quiz page lookup returned invalid JSON.',
          { cause: error }
        )
      }

      if (!Array.isArray(pages)) {
        throw new QuizWordPressError(
          'WordPress quiz page lookup returned an invalid response.'
        )
      }

      return pages[0] || null
    } catch (error) {
      const normalizedError =
        error instanceof QuizWordPressError
          ? error
          : new QuizWordPressError('WordPress is temporarily unavailable.', {
              cause: error,
            })

      lastError = normalizedError
      if (attempt === 2 || !shouldRetryWordPress(normalizedError.status)) {
        console.error('WordPress quiz page lookup unavailable', {
          status: normalizedError.status || null,
          message: normalizedError.message,
        })
        throw normalizedError
      }

      await wait(WORDPRESS_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

async function saveQuizToWordPress(questions) {
  if (!WP_USER || !WP_PASS) {
    throw new Error('WordPress credentials not configured.')
  }

  const existing = await getMainQuizPage()
  if (!existing) {
    throw new Error(`WordPress page "${HOME_PAGE_SLUG}" was not found.`)
  }

  const authHeader = createAuthHeader(WP_USER, WP_PASS)
  const pageData = {
    title: `Daily Quiz - ${getKarachiDateLabel()}`,
    content: formatQuizContent(questions),
    slug: HOME_PAGE_SLUG,
    status: 'publish',
  }

  try {
    const res = await fetch(`${WP_API_URL}/pages/${existing.id}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || `WordPress API error: ${res.status}`)
    }

    return await res.json()
  } catch (err) {
    console.error('Error saving to WordPress:', err)
    throw err
  }
}

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const page = await getMainQuizPage()
    if (!page) {
      return NextResponse.json({ questions: [], date: getKarachiDateISO() })
    }

    return NextResponse.json({
      questions: parseQuizTables(page.content.rendered),
      date: getKarachiDateISO(),
      id: page.id,
    })
  } catch (err) {
    const status = err instanceof QuizWordPressError ? 503 : 500
    return NextResponse.json(
      {
        message:
          status === 503
            ? 'WordPress is temporarily unavailable. Please try again.'
            : 'Error fetching quiz: ' + err.message,
      },
      { status }
    )
  }
}

export async function POST(request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { questions } = body

    let normalizedQuestions
    try {
      normalizedQuestions = normalizeQuizQuestions(questions)
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    const page = await saveQuizToWordPress(normalizedQuestions)

    revalidateTag('quiz')

    return NextResponse.json({
      message: 'Quiz saved successfully to WordPress',
      data: {
        questions: normalizedQuestions,
        date: getKarachiDateISO(),
        id: page.id,
      },
    })
  } catch (err) {
    console.error('Error in POST /api/quiz:', err.message)
    const status = err instanceof QuizWordPressError ? 503 : 500
    return NextResponse.json(
      {
        message:
          status === 503
            ? 'WordPress is temporarily unavailable. Quiz was not saved. Please try again.'
            : 'Error saving quiz: ' + err.message,
      },
      { status }
    )
  }
}
