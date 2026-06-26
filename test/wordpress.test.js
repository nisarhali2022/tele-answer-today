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
  assert.doesNotMatch(source, /post=640|page ID `?640`?|\/pages\/640/)
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

test('homepage TOC includes H1 and all main-content H2/H3 anchors', async () => {
  const { homeAnchorId } = await import('../lib/homeAnchors.js')
  const pageSource = await readFile(
    new URL('../app/page.jsx', import.meta.url),
    'utf8'
  )
  const quizInfoSource = await readFile(
    new URL('../components/home/QuizInfoSections.jsx', import.meta.url),
    'utf8'
  )
  const stepsSource = await readFile(
    new URL('../components/home/StepsSection.jsx', import.meta.url),
    'utf8'
  )
  const latestNewsSource = await readFile(
    new URL('../components/home/LatestNewsGrid.jsx', import.meta.url),
    'utf8'
  )
  const faqSource = await readFile(
    new URL('../components/home/FaqSection.jsx', import.meta.url),
    'utf8'
  )

  const requiredTocTitles = [
    'Latest News',
    'What is the Telenor Daily Quiz?',
    'How to Find the Correct My Telenor Quiz Answers Today Quickly?',
    'How to Play the Telenor Quiz Today and Win Free MBs?',
    'How to Get Verified Telenor Quiz Today Answer Before It Expires?',
    'Why Do People Love the Daily Telenor Quiz So Much?',
    'Who Can Participate in the Today Telenor Quiz Answer?',
    'Eligibility Details',
    'Key Participation Rules',
    'Rewards',
    'What You Get from My Telenor Today Answers?',
    'How Can You Always Get Accurate Today Telenor Quiz?',
    'What is the Fastest Way to Get Accurate Answers Using Modern AI?',
    'Quick AI Solution Method',
    "What to Do If the Telenor Quiz Isn't Working",
    'Quiz Not Loading?',
    'App Keeps Crashing?',
    "Didn't Receive Free MBs?",
    'Discover the Educational Benefits',
    'Tips to Maximize Your Success',
    'Tips for a Seamless Telenor Quiz Experience:',
    'Keep Your App Updated',
    'Check Your Device Storage and Software',
    'Use Stable Internet',
    'Report Persistent Issues',
    'Enjoy a Hassle-Free Quiz',
    'Why You Should Play the Telenor Quiz Every Day',
    'Earn Free Daily Internet',
    'Sharpen Your Knowledge',
    'Learn on the Go',
    'Fast and Fun',
    'How Telenor Maintains Quiz Fairness',
    'The Future of Today My Telenor Answer',
    'Conclusion',
    'Steps to Participate',
    'Install the My Telenor App',
    'Log In with Your Telenor SIM',
    'Navigate to the "Play & Win" Section',
    'Answer 5 Quiz Questions',
    'Claim Your Reward',
    'FAQs - My Telenor Answers Today',
  ]

  for (const title of requiredTocTitles) {
    const id = homeAnchorId(title)

    assert.doesNotMatch(id, /\s|%20/)
    assert.ok(
      pageSource.includes(title),
      `${title} should be listed in HOME_TOC with full text`
    )

    assert.ok(
      `${pageSource}\n${quizInfoSource}\n${stepsSource}\n${latestNewsSource}\n${faqSource}`.includes(title) ||
        `${pageSource}\n${quizInfoSource}\n${stepsSource}\n${latestNewsSource}\n${faqSource}`.includes(id),
      `${id} should exist as a rendered anchor source`
    )
  }

  assert.match(pageSource, /tocItem\(`My Telenor Answer Today \$\{todayLabel\} - Latest Telenor Quiz Today`, 1\)/)
  assert.match(pageSource, /tocItem\(`Today Telenor Answer \$\{todayLabel\}`, 2\)/)
  assert.match(pageSource, /id=\{homeAnchorId\(h1Text\)\}/)
  assert.match(pageSource, /id=\{homeAnchorId\(quizHeading\)\}/)
  assert.match(pageSource, /tocItem\('How to Play the Telenor Quiz Today and Win Free MBs\?', 2\)/)
  assert.doesNotMatch(pageSource, /post\.title/)
})

test('homepage TOC label is not rendered as a heading', async () => {
  const source = await readFile(
    new URL('../components/posts/TableOfContents.jsx', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /<h[1-6][^>]*>\s*Table of Contents\s*<\/h[1-6]>/)
  assert.match(source, />\s*Table of Contents\s*</)
})

test('homepage TOC anchors use readable hyphen fragments', async () => {
  const { homeAnchorId } = await import('../lib/homeAnchors.js')
  const tocSource = await readFile(
    new URL('../components/posts/TableOfContents.jsx', import.meta.url),
    'utf8'
  )

  assert.equal(
    homeAnchorId('How to Play the Telenor Quiz Today and Win Free MBs?'),
    'How-to-Play-the-Telenor-Quiz-Today-and-Win-Free-MBs'
  )
  assert.doesNotMatch(
    homeAnchorId('How to Play the Telenor Quiz Today and Win Free MBs?'),
    /\s|%20/
  )
  assert.match(tocSource, /href=\{`#\$\{item\.id\}`\}/)
  assert.doesNotMatch(tocSource, /encodeURIComponent/)
})

test('global anchor offsets keep hash targets below the fixed header', async () => {
  const css = await readFile(
    new URL('../styles/globals.css', import.meta.url),
    'utf8'
  )

  assert.match(css, /scroll-padding-top:\s*80px/)
  assert.match(css, /scroll-padding-top:\s*110px/)
  assert.match(css, /main \[id\]/)
  assert.match(css, /\.prose \[id\]/)
  assert.match(css, /scroll-margin-top:\s*80px/)
  assert.match(css, /scroll-margin-top:\s*110px/)
})

test('homepage latest news fetches a wider lightweight post pool', async () => {
  const source = await readFile(
    new URL('../app/page.jsx', import.meta.url),
    'utf8'
  )

  assert.match(source, /getPosts\(\{ page: 1, perPage: 60,/)
  assert.doesNotMatch(source, /getPosts\(\{ page: 1, perPage: 12,/)
})

test('latest news keeps the newest two fixed and randomizes only older posts', async () => {
  const { selectLatestNewsPosts } = await import('../lib/latestNews.js')
  const originalRandom = Math.random
  const posts = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    slug: `post-${index + 1}`,
    title: { rendered: `Post ${index + 1}` },
  }))

  Math.random = () => 0

  try {
    const selected = selectLatestNewsPosts(posts, 6)

    assert.equal(selected.length, 6)
    assert.equal(selected[0], posts[0])
    assert.equal(selected[1], posts[1])
    assert.ok(selected.slice(2).every((post) => posts.indexOf(post) >= 2))
  } finally {
    Math.random = originalRandom
  }
})

test('latest news selection safely handles fewer than six posts', async () => {
  const { selectLatestNewsPosts } = await import('../lib/latestNews.js')
  const posts = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    slug: `post-${index + 1}`,
    title: { rendered: `Post ${index + 1}` },
  }))

  const selected = selectLatestNewsPosts(posts, 6)

  assert.equal(selected.length, 4)
  assert.deepEqual(
    selected.map((post) => post.id).sort((a, b) => a - b),
    [1, 2, 3, 4]
  )
  assert.equal(selected[0], posts[0])
  assert.equal(selected[1], posts[1])
})

test('revalidation accepts full nested paths for production WordPress updates', async () => {
  const { getRevalidationPaths } = await import('../lib/revalidation.js')
  const paths = getRevalidationPaths({
    path: '/telenor/telenor-packages/',
    slug: 'ignored-slug',
  })

  assert.ok(paths.includes('/'))
  assert.ok(paths.includes('/sitemap_index.xml'))
  assert.ok(paths.includes('/post-sitemap.xml'))
  assert.ok(paths.includes('/page-sitemap.xml'))
  assert.ok(paths.includes('/category-sitemap.xml'))
  assert.ok(paths.includes('/telenor/telenor-packages'))
  assert.ok(!paths.includes('/ignored-slug'))
})

test('revalidation builds nested paths from category and slug fallback', async () => {
  const { getRevalidationPaths } = await import('../lib/revalidation.js')
  const paths = getRevalidationPaths({
    category: 'telenor',
    slug: 'telenor-packages',
  })

  assert.ok(paths.includes('/telenor/telenor-packages'))
  assert.ok(!paths.includes('/telenor-packages'))
})

test('revalidation keeps slug-only behavior for old webhook bodies', async () => {
  const { getRevalidationPaths } = await import('../lib/revalidation.js')
  const paths = getRevalidationPaths({ slug: 'privacy-policy' })

  assert.ok(paths.includes('/privacy-policy'))
})

test('revalidate route rejects unauthorized requests before revalidating', async () => {
  const previousSecret = process.env.REVALIDATE_SECRET
  process.env.REVALIDATE_SECRET = 'test-secret'

  try {
    const { POST } = await import('../app/api/revalidate/route.js')
    const response = await POST(
      new Request('https://teleanswertoday.pk/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'wrong-secret' },
        body: JSON.stringify({ path: '/telenor/telenor-packages' }),
      })
    )
    const body = await response.json()

    assert.equal(response.status, 401)
    assert.equal(body.message, 'Unauthorized')
  } finally {
    if (previousSecret === undefined) {
      delete process.env.REVALIDATE_SECRET
    } else {
      process.env.REVALIDATE_SECRET = previousSecret
    }
  }
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

test('mobile ad wrappers collapse empty ads instead of reserving large blank space', async () => {
  const bannerSource = await readFile(
    new URL('../components/ads/AdBanner.jsx', import.meta.url),
    'utf8'
  )
  const inArticleSource = await readFile(
    new URL('../components/ads/AdInArticle.jsx', import.meta.url),
    'utf8'
  )
  const lazySource = await readFile(
    new URL('../components/ads/LazyAdSenseUnit.jsx', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(bannerSource, /min-h-\[250px\]/)
  assert.doesNotMatch(inArticleSource, /min-h-\[250px\]/)
  assert.match(lazySource, /adStatus === 'empty'/)
  assert.match(lazySource, /min-h-16 md:min-h-\[120px\]/)
})
