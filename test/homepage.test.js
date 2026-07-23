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

test('empty CMS headings are removed from homepage HTML and the TOC', async () => {
  const { prepareHomeContent } = await import('../lib/homeContent.js')
  const prepared = prepareHomeContent(
    '<h2></h2><h3>&nbsp;</h3><h2>Visible section</h2><p>Body</p>'
  )

  assert.doesNotMatch(prepared.html, /<h2>\s*<\/h2>|<h3>&nbsp;<\/h3>/)
  assert.deepEqual(prepared.headings, [
    { id: 'Visible-section', level: 2, text: 'Visible section' },
  ])
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

test('homepage defers only informational content after Latest News', async () => {
  const [home, info, steps, styles] = await Promise.all([
    readSource('../app/page.jsx'),
    readSource('../components/home/QuizInfoSections.jsx'),
    readSource('../components/home/StepsSection.jsx'),
    readSource('../styles/globals.css'),
  ])

  const latestNewsIndex = home.indexOf('<LatestNewsGrid posts={newsPosts} />')
  const guideDeferredIndex = home.indexOf('className="home-section-deferred my-6"')
  const cmsDeferredIndex = home.indexOf('className="home-content-deferred article-content')

  assert.ok(latestNewsIndex >= 0)
  assert.ok(guideDeferredIndex > latestNewsIndex)
  assert.ok(cmsDeferredIndex > latestNewsIndex)
  assert.match(info, /className=\{`home-section-deferred my-8/)
  assert.doesNotMatch(info, /<div className="render-deferred">/)
  assert.match(steps, /className="home-content-deferred my-8"/)
  assert.match(styles, /\.home-section-deferred\s*\{[\s\S]*?content-visibility:\s*auto/)
  assert.match(styles, /\.home-content-deferred\s*\{[\s\S]*?content-visibility:\s*auto/)
  assert.equal((styles.match(/\.home-section-deferred\s*\{/g) || []).length, 2)
  assert.equal((styles.match(/\.home-content-deferred\s*\{/g) || []).length, 2)
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

test('TOC uses a native disclosure without client state or hydration', async () => {
  const tocSource = await readSource('../components/posts/TableOfContents.jsx')

  assert.match(tocSource, /<details/)
  assert.match(tocSource, /<summary/)
  assert.match(tocSource, /open=\{defaultExpanded\}/)
  assert.match(tocSource, /group-open:rotate-0/)
  assert.doesNotMatch(tocSource, /['"]use client['"]/)
  assert.doesNotMatch(tocSource, /useState|onClick/)
  assert.doesNotMatch(tocSource, /<button/)
})

test('server post selectors keep fixed news posts and return unique cards safely', async () => {
  const { selectLatestNewsPosts, selectRandomPosts } = await import('../lib/latestNews.js')
  const posts = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }))
  const selected = selectLatestNewsPosts(posts, 6, () => 0.25)

  assert.equal(selected.length, 6)
  assert.equal(selected[0], posts[0])
  assert.equal(selected[1], posts[1])
  assert.ok(selected.slice(2).every((post) => posts.indexOf(post) >= 2))
  assert.equal(new Set(selected.map((post) => post.id)).size, 6)

  const shortSelection = selectLatestNewsPosts(posts.slice(0, 4), 6, () => 0.5)
  assert.equal(shortSelection.length, 4)
  assert.equal(new Set(shortSelection.map((post) => post.id)).size, 4)

  const recentPosts = selectRandomPosts(posts, 5, () => 0.75)
  assert.equal(recentPosts.length, 5)
  assert.equal(new Set(recentPosts.map((post) => post.id)).size, 5)
})

test('Latest News and Recent Posts use server selection with CMS-tagged caching', async () => {
  const [home, latestNews, recentPosts, sidebar, cms] = await Promise.all([
    readSource('../app/page.jsx'),
    readSource('../components/home/LatestNewsGrid.jsx'),
    readSource('../components/widgets/RecentPosts.jsx'),
    readSource('../components/layout/Sidebar.jsx'),
    readSource('../lib/cms/index.js'),
  ])

  assert.match(home, /selectLatestNewsPosts\(newsData\?\.posts \|\| \[\], 6\)/)
  assert.match(sidebar, /getSidebarPostLists\(\)/)
  assert.match(cms, /unstable_cache/)
  assert.match(cms, /revalidate:\s*CACHE_SECONDS/)
  assert.match(cms, /tags:\s*\['cms', 'sidebar-post-selection'\]/)
  assert.match(cms, /popularPosts:\s*posts\.slice\(0, safePopularLimit\)/)

  for (const source of [latestNews, recentPosts]) {
    assert.doesNotMatch(source, /['"]use client['"]/)
    assert.doesNotMatch(source, /useState|useEffect|Math\.random/)
  }
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

test('robots protect administrative and preview routes while exposing the sitemap index', async () => {
  const source = await readSource('../app/robots.js')

  assert.match(source, /'\/admin\/'/)
  assert.match(source, /'\/api\/'/)
  assert.match(source, /'\/preview\/'/)
  assert.match(source, /sitemap_index\.xml/)
})

test('post metadata prefers CMS reading time before body fallback', async () => {
  const source = await readSource('../components/posts/PostMeta.jsx')

  assert.match(
    source,
    /calculateReadingTime\(\s*post\?\.content,\s*post\?\.readingTimeMinutes\s*\?\?\s*post\?\.cms\?\.readingTimeMinutes/s
  )
})
