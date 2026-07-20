import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('homepage reads the global CMS quiz and homepage template separately', async () => {
  const source = await readSource('../app/page.jsx')

  assert.match(source, /getCurrentQuiz/)
  assert.match(source, /getHomeTemplate/)
  assert.match(source, /Array\.isArray\(quiz\?\.questions\)/)
  assert.match(source, /removeHomeFaqSection/)
})

test('homepage supports a CMS-authored Home template while retaining a static fallback', async () => {
  const [source, helperSource] = await Promise.all([
    readSource('../app/page.jsx'),
    readSource('../lib/homeContent.js'),
  ])

  assert.match(source, /contentData\?\.heroText/)
  assert.match(source, /usesCmsHomeContent/)
  assert.match(source, /QuizAnswerCards questions=\{quizQuestions\}/)
  assert.match(source, /LatestNewsGrid posts=\{newsPosts\}/)
  assert.match(helperSource, /formatHomeTemplate/)
  assert.match(helperSource, /ensureSingleHomeH1/)
})

test('CMS homepage content receives one H1, readable anchors, and a quiz insertion point', async () => {
  const {
    ensureSingleHomeH1,
    formatHomeTemplate,
    prepareHomeContent,
    removeHomeFaqSection,
    splitHomeContentAtQuizHeading,
  } = await import('../lib/homeContent.js')
  const html = formatHomeTemplate(
    '<h1>My Telenor Answer {date}</h1><p>Intro</p><h2>Today Telenor Answer {date}</h2><h2>Guide</h2>',
    '20 July 2026'
  )
  const normalized = ensureSingleHomeH1(html, 'Fallback H1')
  const split = splitHomeContentAtQuizHeading(normalized)
  const before = prepareHomeContent(split.beforeHtml)
  const quiz = prepareHomeContent(split.quizHeadingHtml, new Set(before.headings.map((item) => item.id)))

  assert.equal((normalized.match(/<h1\b/gi) || []).length, 1)
  assert.match(before.html, /id="My-Telenor-Answer-20-July-2026"/)
  assert.equal(quiz.headings[0].text, 'Today Telenor Answer 20 July 2026')

  const formattedHeading = splitHomeContentAtQuizHeading(
    '<h1>Intro</h1><h2><strong>Today Telenor Answer 20 July 2026</strong></h2><p>After</p>'
  )
  assert.match(formattedHeading.beforeHtml, /Intro/)
  assert.match(formattedHeading.quizHeadingHtml, /Today Telenor Answer 20 July 2026/)
  assert.match(formattedHeading.afterHtml, /After/)

  const withoutFaqs = removeHomeFaqSection(
    '<h2>Guide</h2><p>Keep this.</p><h2>FAQs - My Telenor Answers Today</h2><p>Remove this.</p>'
  )
  assert.match(withoutFaqs, /Keep this\./)
  assert.doesNotMatch(withoutFaqs, /FAQs - My Telenor Answers Today|Remove this\./)
})

test('Terms and Disclaimer use dedicated CMS legal page layouts', async () => {
  const [terms, disclaimer, legal] = await Promise.all([
    readSource('../app/terms-of-service/page.jsx'),
    readSource('../app/disclaimer/page.jsx'),
    readSource('../components/pages/LegalPage.jsx'),
  ])

  assert.match(terms, /LegalPage/)
  assert.match(disclaimer, /LegalPage/)
  assert.match(legal, /prepareContent\(page\.content\)/)
})

test('homepage retains one H1 and does not render FAQ output', async () => {
  const source = await readSource('../app/page.jsx')

  assert.equal((source.match(/<h1\b/g) || []).length, 1)
  assert.doesNotMatch(source, /FAQPage/)
  assert.doesNotMatch(source, /<FaqSection\b/)
  assert.doesNotMatch(source, /getVisibleHomeFaqs/)
})

test('homepage order places quiz and Latest News before the static guide', async () => {
  const source = await readSource('../app/page.jsx')
  const tocIndex = source.indexOf('<TableOfContents toc={homeToc} />')
  const quizIndex = source.indexOf('<QuizAnswerCards questions={quizQuestions} />')
  const latestNewsIndex = source.indexOf('<LatestNewsGrid posts={newsPosts} />')
  const guideIndex = source.indexOf('id={homeAnchorId("Today Telenor Quiz Questions and Answers - Quick Guide")}')

  assert.ok(tocIndex < quizIndex)
  assert.ok(quizIndex < latestNewsIndex)
  assert.ok(latestNewsIndex < guideIndex)
  assert.doesNotMatch(source, /FAQs - My Telenor Answers Today/)
})

test('homepage TOC has readable anchors for main article headings', async () => {
  const { homeAnchorId } = await import('../lib/homeAnchors.js')
  const tocSource = await readSource('../components/posts/TableOfContents.jsx')

  assert.equal(
    homeAnchorId('How to Play the Telenor Quiz Today and Win Free MBs?'),
    'How-to-Play-the-Telenor-Quiz-Today-and-Win-Free-MBs'
  )
  assert.match(tocSource, /href=\{`#\$\{item\.id\}`\}/)
})

test('Latest News keeps the newest two cards fixed and chooses only older cards randomly', async () => {
  const { selectLatestNewsPosts } = await import('../lib/latestNews.js')
  const posts = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }))
  const selected = selectLatestNewsPosts(posts, 6)

  assert.equal(selected.length, 6)
  assert.equal(selected[0], posts[0])
  assert.equal(selected[1], posts[1])
  assert.ok(selected.slice(2).every((post) => posts.indexOf(post) >= 2))
})

test('public quiz options stay full-width on mobile and use two columns from tablet', async () => {
  const source = await readSource('../components/home/QuizAnswerCards.jsx')

  assert.match(source, /className="grid grid-cols-1 gap-2 md:grid-cols-2"/)
  assert.doesNotMatch(source, /min-\[360px\]:grid-cols-2/)
})

test('legacy tag URLs redirect to the CMS blog archive', async () => {
  const source = await readSource('../app/tag/[slug]/page.jsx')

  assert.match(source, /permanentRedirect\('\/blog'\)/)
  assert.doesNotMatch(source, /getPosts|legacy content client/)
})

test('retired local quiz endpoint does not expose an editor', async () => {
  const source = await readSource('../app/api/quiz/route.js')

  assert.match(source, /status: 410/)
  assert.match(source, /Supabase Admin CMS/)
})

test('CMS-backed image components bypass the Vercel image proxy', async () => {
  const [featured, latest, recent] = await Promise.all([
    readSource('../components/posts/FeaturedImage.jsx'),
    readSource('../components/home/LatestNewsGrid.jsx'),
    readSource('../components/widgets/RecentPosts.jsx'),
  ])

  assert.match(featured, /\bunoptimized\b/)
  assert.match(latest, /\bunoptimized\b/)
  assert.match(recent, /\bunoptimized\b/)
})
