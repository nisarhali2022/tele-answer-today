import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

process.env.WORDPRESS_API_URL = 'https://example.test'

async function getWordPressModule() {
  return import('../lib/wordpress.js')
}

test('a successful empty WordPress slug response means missing content', async () => {
  const { getPostBySlug } = await getWordPressModule()
  const originalFetch = globalThis.fetch
  let calls = 0

  globalThis.fetch = async () => {
    calls += 1
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    assert.equal(await getPostBySlug('missing-post'), null)
    assert.equal(calls, 1)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('a temporary WordPress failure retries once and then throws', async () => {
  const { getPostBySlug, WordPressApiError } = await getWordPressModule()
  const originalFetch = globalThis.fetch
  const originalConsoleError = console.error
  let calls = 0

  globalThis.fetch = async () => {
    calls += 1
    return new Response('{}', { status: 503 })
  }
  console.error = () => {}

  try {
    await assert.rejects(
      () => getPostBySlug('temporarily-unavailable'),
      (error) =>
        error instanceof WordPressApiError &&
        error.status === 503
    )
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = originalFetch
    console.error = originalConsoleError
  }
})

test('homepage quiz source loads the telenor-answer-today page', async () => {
  const { getHomepageQuizPage } = await getWordPressModule()
  const originalFetch = globalThis.fetch
  let requestedUrl = ''

  globalThis.fetch = async (url) => {
    requestedUrl = String(url)
    return new Response(
      JSON.stringify([{ id: 640, slug: 'telenor-answer-today' }]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const page = await getHomepageQuizPage()
    assert.equal(page.id, 640)
    assert.match(requestedUrl, /\/pages\?/)
    assert.match(requestedUrl, /slug=telenor-answer-today/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('daily quiz source loads the daily-quiz post', async () => {
  const { getDailyQuizPost } = await getWordPressModule()
  const originalFetch = globalThis.fetch
  let requestedUrl = ''

  globalThis.fetch = async (url) => {
    requestedUrl = String(url)
    return new Response(
      JSON.stringify([{ id: 512, slug: 'daily-quiz' }]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const post = await getDailyQuizPost()
    assert.equal(post.id, 512)
    assert.match(requestedUrl, /\/posts\?/)
    assert.match(requestedUrl, /slug=daily-quiz/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('homepage and daily quiz slugs are both excluded from public post lists', async () => {
  const { EXCLUDED_CONTENT_SLUGS } = await import('../lib/constants.js')

  assert.ok(EXCLUDED_CONTENT_SLUGS.includes('telenor-answer-today'))
  assert.ok(EXCLUDED_CONTENT_SLUGS.includes('daily-quiz'))
})

test('admin quiz API targets the daily-quiz WordPress post', async () => {
  const source = await readFile(
    new URL('../app/api/quiz/route.js', import.meta.url),
    'utf8'
  )

  assert.match(source, /DAILY_QUIZ_SLUG/)
  assert.match(source, /\/posts\?slug=/)
  assert.match(source, /\/posts\$\{existing \? `\/\$\{existing\.id\}` : ''\}/)
  assert.match(source, /method: existing \? 'PUT' : 'POST'/)
  assert.doesNotMatch(source, /HOME_PAGE_SLUG/)
  assert.doesNotMatch(source, /\/pages\?slug=/)
  assert.doesNotMatch(source, /\/pages\/\$\{existing\.id\}/)
})

test('homepage parses quiz and FAQ content from separate WordPress sources', async () => {
  const source = await readFile(
    new URL('../app/page.jsx', import.meta.url),
    'utf8'
  )

  assert.match(source, /getDailyQuizPost/)
  assert.match(source, /getHomepageQuizPage/)
  assert.match(source, /const quizContent = quizPage\?\.content\?\.rendered \|\| ''/)
  assert.match(source, /const homepageContent = homepagePage\?\.content\?\.rendered \|\| ''/)
  assert.match(source, /parseQuizTables\(quizContent\)/)
  assert.match(source, /parseFaqs\(homepageContent\)/)
  assert.doesNotMatch(source, /parseQuizTables\(homepageContent\)/)
})

test('admin session cookie secure flag follows the request protocol', async () => {
  const { getAdminSessionCookieOptions } = await import('../lib/adminAuth.js')
  const httpOptions = getAdminSessionCookieOptions({
    headers: new Headers(),
    nextUrl: { protocol: 'http:' },
  })
  const httpsOptions = getAdminSessionCookieOptions({
    headers: new Headers({ 'x-forwarded-proto': 'https' }),
    nextUrl: { protocol: 'http:' },
  })

  assert.equal(httpOptions.secure, false)
  assert.equal(httpsOptions.secure, true)
  assert.equal(httpOptions.sameSite, 'lax')
})
