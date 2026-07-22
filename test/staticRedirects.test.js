import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  createStaticRedirects,
  fetchCmsStaticRedirects,
} = require('../lib/staticRedirects.cjs')

test('CMS static redirects preserve 301 and 302 intent', () => {
  assert.deepEqual(
    createStaticRedirects([
      { from_path: '/old-post/', to_url: '/telecom/new-post/', redirect_type: 301 },
      { from_path: '/temporary', to_url: 'https://www.teleanswertoday.pk/blog/', redirect_type: '302' },
    ], 'teleanswertoday.pk'),
    [
      { source: '/old-post', destination: '/telecom/new-post', permanent: true },
      { source: '/temporary', destination: '/blog', permanent: false },
    ]
  )
})

test('CMS static redirects reject invalid, duplicate, looping, external, and reserved paths', () => {
  const domain = 'teleanswertoday.pk'
  const invalidRecords = [
    [[{ from_path: 'old', to_url: '/new', redirect_type: 301 }], /Invalid redirect source/],
    [[{ from_path: '/old?source=legacy', to_url: '/new', redirect_type: 301 }], /Invalid redirect source/],
    [[{ from_path: '/old', to_url: 'https://outside.example/new', redirect_type: 301 }], /must stay on/],
    [[{ from_path: '/old', to_url: '/old', redirect_type: 301 }], /loop/],
    [
      [
        { from_path: '/old', to_url: '/new', redirect_type: 301 },
        { from_path: '/old/', to_url: '/different', redirect_type: 301 },
      ],
      /Duplicate redirect source/,
    ],
    [[{ from_path: '/about', to_url: '/about-us', redirect_type: 301 }], /reserved/],
    [[{ from_path: '/old', to_url: '/new', redirect_type: 307 }], /Unsupported redirect type/],
  ]

  for (const [records, error] of invalidRecords) {
    assert.throws(() => createStaticRedirects(records, domain), error)
  }
})

test('CMS static redirects fetch the domain-scoped public RPC', async () => {
  let request = null
  const redirects = await fetchCmsStaticRedirects({
    domain: 'teleanswertoday.pk',
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'public-key',
    fetchImpl: async (url, options) => {
      request = { url, options }
      return {
        ok: true,
        json: async () => [
          { from_path: '/old', to_url: '/new', redirect_type: 301 },
        ],
      }
    },
  })

  assert.equal(request.url, 'https://example.supabase.co/rest/v1/rpc/list_public_redirects')
  assert.deepEqual(JSON.parse(request.options.body), { domain: 'teleanswertoday.pk' })
  assert.deepEqual(redirects, [
    { source: '/old', destination: '/new', permanent: true },
  ])
})

test('CMS static redirects fail when the public redirect feed is unavailable', async () => {
  await assert.rejects(
    fetchCmsStaticRedirects({
      domain: 'teleanswertoday.pk',
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'public-key',
      fetchImpl: async () => ({ ok: false, status: 503 }),
    }),
    /failed with 503/
  )
})
