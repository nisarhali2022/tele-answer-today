import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ADSENSE_PUBLISHER_ID, getAdSlot } from '../lib/constants.js'
import { hasAdAfterQuestion, splitContentForAds } from '../lib/utils.js'

async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8')
}

const paragraphs = (count) =>
  Array.from({ length: count }, (_, i) => `<p>Paragraph ${i + 1}</p>`).join('')

test('content gets an ad slot after every 3rd paragraph, max 4, never at the end', () => {
  assert.equal(splitContentForAds(paragraphs(3)).length, 1)
  assert.equal(splitContentForAds(paragraphs(4)).length, 2)
  assert.equal(splitContentForAds(paragraphs(7)).length, 3)
  assert.equal(splitContentForAds(paragraphs(40)).length, 5)

  const chunks = splitContentForAds(paragraphs(7))
  assert.equal(chunks.join(''), paragraphs(7))
  assert.match(chunks[0], /Paragraph 3<\/p>$/)
})

test('content splitting ignores nested and empty paragraphs', () => {
  const html =
    '<p>One</p><ul><li><p>Nested</p></li></ul><p></p><p>Two</p><div><p>In div</p></div><p>Three</p><p>Four</p>'
  const chunks = splitContentForAds(html)

  assert.equal(chunks.length, 2)
  assert.match(chunks[0], /<p>Three<\/p>$/)
  assert.equal(chunks.join(''), html)
  assert.deepEqual(splitContentForAds(''), [''])
})

test('quiz ads follow questions 1 and 3, never the last question', () => {
  const after = (total) =>
    Array.from({ length: total }, (_, i) => i).filter((i) => hasAdAfterQuestion(i, total)).map((i) => i + 1)

  assert.deepEqual(after(5), [1, 3])
  assert.deepEqual(after(3), [1])
  assert.deepEqual(after(1), [])
  assert.deepEqual(after(8), [1, 3, 5, 7])
})

test('AdSense publisher, slots and ads.txt live in code, not the CMS', async () => {
  assert.equal(ADSENSE_PUBLISHER_ID, 'ca-pub-9444471613078101')
  assert.equal(getAdSlot('top'), '3784481034')
  assert.equal(getAdSlot('display'), '3784481034')
  assert.equal(getAdSlot('multiplex'), '8537280112')
  assert.equal(getAdSlot('unknown'), '3784481034')

  const [adsTxt, layout] = await Promise.all([
    readSource('../public/ads.txt'),
    readSource('../app/layout.jsx'),
  ])
  assert.equal(adsTxt.trim(), 'google.com, pub-9444471613078101, DIRECT, f08c47fec0942fa0')
  assert.match(layout, /client=\$\{ADSENSE_PUBLISHER_ID\}/)
  assert.doesNotMatch(layout, /getSiteSettings|adsense\.enabled/)
})

test('homepage places an image ad above the TOC and hides lower ads on phones', async () => {
  const source = await readSource('../app/page.jsx')
  const imageAd = source.indexOf('<AdImage')
  const toc = source.indexOf('<TableOfContents')

  assert.ok(imageAd > 0 && imageAd < toc, 'image ad should come before the TOC')
  assert.match(source, /const MOBILE_HIDDEN = 'hidden md:block'/)
  assert.match(source, /adClassName=\{MOBILE_HIDDEN\}/)
  assert.match(source, /<AdBanner position="mid" className=\{MOBILE_HIDDEN\} \/>/)
  assert.match(source, /<AdBanner position="bottom" variant="horizontal" className=\{MOBILE_HIDDEN\} \/>/)
  assert.match(source, /<SideRailAds \/>/)
})

test('articles split content for ads and end with a Multiplex unit', async () => {
  const source = await readSource('../app/[slug]/[post_slug]/page.jsx')
  const related = source.indexOf('Related Posts')
  const multiplex = source.indexOf('<AdMultiplex')

  assert.match(source, /<ContentWithAds/)
  assert.doesNotMatch(source, /injectAdAfterFirstParagraph/)
  assert.ok(multiplex > related, 'Multiplex should follow Related Posts')
  assert.match(source, /<AdBanner position="top" variant="horizontal" \/>/)
  assert.match(source, /<AdBanner position="bottom" variant="horizontal" \/>/)
})

test('every banner collapses fully when AdSense leaves it unfilled', async () => {
  const [banner, css] = await Promise.all([
    readSource('../components/ads/AdBanner.jsx'),
    readSource('../styles/globals.css'),
  ])

  assert.match(banner, /status === 'empty'\) \{\s*return null/)
  assert.doesNotMatch(banner, /position !== 'top'/)
  assert.match(css, /ins\.adsbygoogle\[data-ad-status="unfilled"\]/)
})
