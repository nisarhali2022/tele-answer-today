import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

test('homepage reads the global CMS quiz and CMS homepage FAQs separately', async () => {
  const source = await readSource('../app/page.jsx')

  assert.match(source, /getCurrentQuiz/)
  assert.match(source, /getHomeTemplate/)
  assert.match(source, /Array\.isArray\(quiz\?\.questions\)/)
  assert.match(source, /homepageTemplate\?\.contentData\?\.faqs/)
})

test('homepage retains one H1 and visible-only FAQPage schema', async () => {
  const source = await readSource('../app/page.jsx')
  const faqSource = await readSource('../lib/homeFaqs.js')

  assert.equal((source.match(/<h1\b/g) || []).length, 1)
  assert.match(source, /'@type': 'FAQPage'/)
  assert.match(source, /mainEntity: visibleFaqs\.map/)
  assert.match(faqSource, /slice\(0, 6\)/)
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
