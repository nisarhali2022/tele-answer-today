import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateReadingTime,
  getFeaturedImageDimensions,
  getFeaturedImageUrl,
  normalizeContentLinks,
  optimizeContentImages,
  prepareContent,
  removeContentH1Blocks,
  wrapContentTables,
} from '../lib/utils.js'

test('featured images select responsive CMS variants with an original fallback', () => {
  const post = {
    featuredImage: {
      url: 'https://cdn.example.com/original.webp',
      width: 1200,
      height: 675,
      variants: {
        thumbnail: {
          url: 'https://cdn.example.com/thumbnail.webp',
          width: 160,
          height: 90,
        },
        card: {
          url: 'https://cdn.example.com/card.webp',
          width: 400,
          height: 225,
        },
      },
    },
  }

  assert.equal(getFeaturedImageUrl(post, 'thumbnail'), 'https://cdn.example.com/thumbnail.webp')
  assert.equal(getFeaturedImageUrl(post, 'medium_large'), 'https://cdn.example.com/card.webp')
  assert.equal(getFeaturedImageUrl(post, 'mobile'), 'https://cdn.example.com/original.webp')
  assert.equal(getFeaturedImageUrl(post), 'https://cdn.example.com/original.webp')
  assert.deepEqual(getFeaturedImageDimensions(post, 'card'), { width: 400, height: 225 })
})

test('reading time prefers the supplied CMS value', () => {
  assert.equal(calculateReadingTime('<p>Short card excerpt</p>', 4), '4 min read')
})

test('supplied decimal reading times round up', () => {
  assert.equal(calculateReadingTime('<p>Short card excerpt</p>', 2.1), '3 min read')
})

test('invalid or zero supplied values fall back to content calculation', () => {
  const twoHundredOneWords = Array.from({ length: 201 }, () => 'word').join(' ')

  assert.equal(calculateReadingTime(`<p>${twoHundredOneWords}</p>`, 0), '2 min read')
  assert.equal(calculateReadingTime('<p>Short card excerpt</p>', 'invalid'), '1 min read')
})

test('empty content still has a one-minute minimum', () => {
  assert.equal(calculateReadingTime('', 0), '1 min read')
})

test('body images preserve canonical responsive markup', () => {
  const html =
    '<img src="https://example.com/photo.jpg" width="900" height="600" ' +
    'srcset="photo-450.jpg 450w, photo-900.jpg 900w" sizes="50vw">'
  const result = optimizeContentImages(html)

  assert.match(result, /loading="lazy"/)
  assert.match(result, /decoding="async"/)
  assert.match(result, /width="900"/)
  assert.match(result, /height="600"/)
  assert.match(result, /\bsrc="https:\/\/example\.com\/photo\.jpg"/)
  assert.match(result, /\bsrcset="photo-450\.jpg 450w, photo-900\.jpg 900w"/)
  assert.doesNotMatch(result, /\/_next\/image/)
  assert.equal((result.match(/\bsrcset=/g) || []).length, 1)
  assert.equal((result.match(/\bsizes=/g) || []).length, 1)
})

test('body images infer dimensions from image filenames', () => {
  const result = optimizeContentImages(
    '<img src="https://example.com/photo-683x1024.webp">'
  )

  assert.match(result, /width="683"/)
  assert.match(result, /height="1024"/)
  assert.match(result, /sizes="\(max-width: 768px\) 100vw, 768px"/)
  assert.match(result, /\bsrc="https:\/\/example\.com\/photo-683x1024\.webp"/)
  assert.doesNotMatch(result, /\/_next\/image/)
})
test('body images receive fallback dimensions without proxying sources', () => {
  const result = optimizeContentImages(
    '<img src="https://example.com/photo.webp" alt="Example">'
  )

  assert.match(result, /width="800"/)
  assert.match(result, /height="450"/)
  assert.match(result, /\bsrc="https:\/\/example\.com\/photo\.webp"/)
  assert.doesNotMatch(result, /\/_next\/image/)
  assert.doesNotMatch(result, /\bsrcset=/)
})

test('content h1 blocks are removed while lower headings remain', () => {
  const result = removeContentH1Blocks(
    '<h1 class="wp-block-heading">Post Title</h1><p>Intro</p><h2>Section</h2>'
  )

  assert.doesNotMatch(result, /<h1\b/i)
  assert.match(result, /<p>Intro<\/p>/)
  assert.match(result, /<h2>Section<\/h2>/)
})

test('gutenberg h1 heading comments are removed with the heading', () => {
  const result = removeContentH1Blocks(
    '<!-- wp:heading {"level":1} --><h1>Manual Title</h1><!-- /wp:heading --><p>Body</p>'
  )

  assert.doesNotMatch(result, /wp:heading/i)
  assert.doesNotMatch(result, /<h1\b/i)
  assert.match(result, /<p>Body<\/p>/)
})

test('legacy public content links are rewritten to the current public site', () => {
  const result = normalizeContentLinks(
    '<p>Also Read: <a href="https://telenorquiztoday.com.pk/telecom/example-post/">Example</a></p>'
  )

  assert.match(
    result,
    /href="https:\/\/teleanswertoday\.pk\/telecom\/example-post"/
  )
  assert.doesNotMatch(result, /telenorquiztoday\.com\.pk/)
})

test('CMS content rewrites localhost and non-canonical internal URLs', () => {
  const result = normalizeContentLinks(
    '<a href="http://localhost:3000/telenor/example-post/">Local</a>' +
    '<a href="/telecom/example-post/?source=home">Relative</a>' +
    '<a href="https://www.teleanswertoday.pk/tech/example-post/">WWW</a>' +
    '<a href="https://old.hostingerapp.com/global/example-post/">Hostinger</a>'
  )

  assert.match(result, /href="https:\/\/teleanswertoday\.pk\/telenor\/example-post"/)
  assert.match(result, /href="\/telecom\/example-post\?source=home"/)
  assert.match(result, /href="https:\/\/teleanswertoday\.pk\/tech\/example-post"/)
  assert.doesNotMatch(
    result,
    /localhost:3000|www\.teleanswertoday\.pk|hostingerapp\.com|example-post\//
  )
})

test('legacy WordPress subdomain references are rewritten in CMS page content', () => {
  const result = normalizeContentLinks(
    '<p>Visit https://wp.teleanswertoday.pk/ <a href="https://wp.teleanswertoday.pk/terms/">Terms</a></p>'
  )

  assert.match(result, /https:\/\/teleanswertoday\.pk\//)
  assert.doesNotMatch(result, /wp\.teleanswertoday\.pk/)
})

test('prepared content removes h1 before rendering', () => {
  const result = prepareContent('<h1>Privacy Policy</h1><p>About</p>')

  assert.doesNotMatch(result, /<h1\b/i)
  assert.match(result, /<p>About<\/p>/)
})

test('prepared content wraps tables for mobile horizontal scroll', () => {
  const result = prepareContent(
    '<p>Before</p><table><tbody><tr><td>One</td><td>Two</td></tr></tbody></table><p>After</p>'
  )

  assert.match(result, /<div class="wp-table-scroll"><table>/)
  assert.match(result, /<td>One<\/td><td>Two<\/td>/)
  assert.match(result, /<\/table><\/div><p>After<\/p>/)
})

test('table wrapping does not double-wrap existing responsive tables', () => {
  const result = wrapContentTables(
    '<div class="wp-table-scroll"><table><tbody><tr><td>One</td></tr></tbody></table></div>'
  )

  assert.equal((result.match(/wp-table-scroll/g) || []).length, 1)
})

test('table wrapping leaves non-table content unchanged', () => {
  const html = '<p>Simple paragraph</p><ul><li>Item</li></ul>'

  assert.equal(wrapContentTables(html), html)
})
