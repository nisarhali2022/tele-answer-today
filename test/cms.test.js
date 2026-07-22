import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getAdSenseSettings, getAdSenseSlot } from '../lib/cms/adsense.js'
import { normalizeCmsRevalidationPayload } from '../lib/cms/revalidation.js'
import { resolveCmsDomain } from '../lib/cmsDomain.js'
import { resolveRedirectDestination } from '../lib/redirects.js'

test('CMS domain resolution uses the configured production site for local requests', () => {
  assert.equal(
    resolveCmsDomain('localhost:3000', 'teleanswertoday.pk'),
    'teleanswertoday.pk'
  )
  assert.equal(
    resolveCmsDomain('teleanswertoday.pk', 'example.test'),
    'teleanswertoday.pk'
  )
})

test('CMS AdSense settings require an enabled valid publisher ID and use placement slots', () => {
  const settings = {
    adsense: {
      enabled: true,
      publisherId: 'ca-pub-1234567890',
      adsTxt: 'google.com, pub-1234567890, DIRECT, f08c47fec0942fa0',
      slots: { top: '100', inArticle: '200', afterContent: '300' },
    },
  }

  assert.equal(getAdSenseSettings(settings).enabled, true)
  assert.equal(getAdSenseSlot(settings, 'top'), '100')
  assert.equal(getAdSenseSlot(settings, 'in-article'), '200')
  assert.equal(getAdSenseSlot(settings, 'after-content'), '300')
  assert.equal(getAdSenseSettings({ adsense: { enabled: true, publisherId: 'invalid' } }).enabled, false)
})

test('CMS AdSense settings derive ads.txt from a valid CMS-managed publisher ID', () => {
  const settings = {
    adsense: {
      enabled: false,
      publisherId: 'ca-pub-1234567890',
    },
  }

  assert.equal(
    getAdSenseSettings(settings).adsTxt,
    'google.com, pub-1234567890, DIRECT, f08c47fec0942fa0'
  )
})

test('CMS revalidation accepts only safe public paths', () => {
  assert.deepEqual(
    normalizeCmsRevalidationPayload({
      event: 'global_quiz.updated',
      paths: ['/', '/page-sitemap.xml', 'https://invalid.example'],
      resourceType: 'global_quiz',
      resourceId: 'quiz-id',
    }),
    {
      event: 'global_quiz.updated',
      paths: ['/', '/page-sitemap.xml'],
      resourceType: 'global_quiz',
      resourceId: 'quiz-id',
    }
  )
})

test('public CMS data layer uses only the Supabase anon key and global quiz RPC', async () => {
  const source = await readFile(new URL('../lib/cms/index.js', import.meta.url), 'utf8')

  assert.match(source, /NEXT_PUBLIC_SUPABASE_URL/)
  assert.match(source, /NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  assert.match(source, /cms_public_get_current_quiz/)
  assert.match(source, /get_public_site_settings/)
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/)
})

test('CMS redirect middleware fails open when the redirect lookup is unavailable', async () => {
  const source = await readFile(new URL('../middleware.js', import.meta.url), 'utf8')

  assert.match(source, /try \{[\s\S]*get_public_redirect/)
  assert.match(source, /catch \{[\s\S]*return null/)
})

test('CMS redirects keep final public paths and reject external destinations', () => {
  const internal = resolveRedirectDestination(
    '/telecom/new-post/',
    'https://teleanswertoday.pk/global/old-post',
    'teleanswertoday.pk'
  )
  const canonical = resolveRedirectDestination(
    'http://www.teleanswertoday.pk/telecom/new-post/',
    'https://teleanswertoday.pk/global/old-post',
    'teleanswertoday.pk'
  )

  assert.equal(internal?.toString(), 'https://teleanswertoday.pk/telecom/new-post')
  assert.equal(canonical?.toString(), 'https://teleanswertoday.pk/telecom/new-post')
  assert.equal(
    resolveRedirectDestination(
      'https://outside.example/telecom/new-post',
      'https://teleanswertoday.pk/global/old-post',
      'teleanswertoday.pk'
    ),
    null
  )
})
