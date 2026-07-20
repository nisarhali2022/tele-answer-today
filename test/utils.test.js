import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeContentLinks,
  optimizeContentImages,
  prepareContent,
  removeContentH1Blocks,
  wrapContentTables,
} from '../lib/utils.js'

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
    /href="https:\/\/teleanswertoday\.pk\/telecom\/example-post\/"/
  )
  assert.doesNotMatch(result, /telenorquiztoday\.com\.pk/)
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
