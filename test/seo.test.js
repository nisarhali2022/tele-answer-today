import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildMetadata,
  canonicalPath,
  isInvalidArchivePage,
  notFoundMetadata,
  normalizeRobots,
  parsePageNumber,
} from '../lib/seo.js'

test('canonicalPath preserves query values and pagination', () => {
  assert.equal(canonicalPath('/blog', 1), '/blog')
  assert.equal(canonicalPath('/blog', 2), '/blog?page=2')
  assert.equal(
    canonicalPath('/search', 3, { q: 'daily quiz' }),
    '/search?q=daily+quiz&page=3'
  )
})

test('parsePageNumber accepts only positive safe integers', () => {
  assert.equal(parsePageNumber(undefined), 1)
  assert.equal(parsePageNumber('2'), 2)
  assert.equal(parsePageNumber('0'), null)
  assert.equal(parsePageNumber('-1'), null)
  assert.equal(parsePageNumber('1.5'), null)
})

test('archive validation rejects invalid and out-of-range pages', () => {
  assert.equal(isInvalidArchivePage({ totalPages: 2 }, 2), false)
  assert.equal(isInvalidArchivePage({ totalPages: 2 }, 3), true)
  assert.equal(isInvalidArchivePage({ invalidPage: true }, 2), true)
})

test('metadata uses an absolute self-canonical URL without a trailing slash', () => {
  const metadata = buildMetadata({
    title: 'Example Article',
    description: 'Example description',
    path: '/telecom/example-article/',
  })

  assert.equal(
    metadata.alternates.canonical,
    'https://teleanswertoday.pk/telecom/example-article'
  )
  assert.equal(
    metadata.openGraph.url,
    'https://teleanswertoday.pk/telecom/example-article'
  )
})

test('CMS robots directives and missing routes resolve to noindex metadata', () => {
  assert.deepEqual(normalizeRobots('noindex, nofollow'), {
    index: false,
    follow: false,
  })
  assert.deepEqual(notFoundMetadata('Post Not Found').robots, {
    index: false,
    follow: true,
  })
})
