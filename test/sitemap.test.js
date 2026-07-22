import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSitemapCategories,
  buildSitemapPages,
  buildSitemapPosts,
  normalizeSitemapPagePath,
  renderUrlSitemap,
} from '../lib/sitemap.js'

test('sitemap post entries keep only published canonical public records', () => {
  const posts = buildSitemapPosts([
    {
      slug: 'published-post',
      categorySlug: 'telecom',
      status: 'published',
      image: { url: 'https://project.supabase.co/storage/v1/object/public/cms-media/published.webp' },
    },
    { slug: 'daily-quiz', categorySlug: 'telenor', status: 'published' },
    { slug: 'draft-post', categorySlug: 'telecom', status: 'draft' },
    { slug: 'hidden-post', categorySlug: 'telecom', noindex: true },
    { slug: 'old-post', categorySlug: 'telecom', redirectTo: '/telecom/new-post' },
    { slug: 'published-post', categorySlug: 'telecom', status: 'published' },
  ])

  assert.deepEqual(posts.map((post) => post.loc), [
    'https://teleanswertoday.pk/telecom/published-post',
  ])
  assert.deepEqual(posts[0].images, [
    'https://project.supabase.co/storage/v1/object/public/cms-media/published.webp',
  ])
})

test('sitemap pages and categories remove aliases, trailing slashes, and noindex records', () => {
  const pages = buildSitemapPages({
    templates: [{ path: '/', sitemapInclude: true }],
    pages: [
      { path: '/about/', sitemapInclude: true },
      { path: '/private', robotsMeta: 'noindex, follow' },
      { path: 'https://wp.teleanswertoday.pk/old-page' },
    ],
    authors: [{ path: '/author/editor/' }],
  })
  const categories = buildSitemapCategories([
    { path: '/telecom/' },
    { path: '/legacy', status: 'deleted' },
  ])

  assert.deepEqual(pages.map((page) => page.loc), [
    'https://teleanswertoday.pk',
    'https://teleanswertoday.pk/about-us',
    'https://teleanswertoday.pk/author/editor',
  ])
  assert.deepEqual(categories.map((category) => category.loc), [
    'https://teleanswertoday.pk/telecom',
  ])
  assert.equal(normalizeSitemapPagePath('https://localhost:3000/post'), null)
})

test('rendered sitemaps exclude legacy, localhost, and image-proxy URLs', () => {
  const xml = renderUrlSitemap([
    {
      loc: 'https://teleanswertoday.pk/telecom/example',
      images: [
        'https://project.supabase.co/storage/v1/object/public/cms-media/example.webp',
        'https://wp.teleanswertoday.pk/wp-content/uploads/old.webp',
        'http://localhost:3000/example.webp',
        'https://teleanswertoday.pk/_next/image?url=example.webp',
      ],
    },
    { loc: 'https://www.teleanswertoday.pk/telecom/not-canonical' },
  ])

  assert.match(xml, /https:\/\/teleanswertoday\.pk\/telecom\/example/)
  assert.match(xml, /project\.supabase\.co/)
  assert.doesNotMatch(xml, /wp\.teleanswertoday|localhost|_next\/image|www\.teleanswertoday/)
})
