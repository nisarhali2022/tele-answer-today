import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { normalizeCmsRevalidationPayload } from '../lib/cms/revalidation.js'
import { resolveCmsDomain } from '../lib/cmsDomain.js'

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

test('public CMS reads use the configured domain without request headers', async () => {
  const source = await readFile(new URL('../lib/cms/index.js', import.meta.url), 'utf8')

  assert.match(source, /CMS_SITE_DOMAIN is required for public CMS reads/)
  assert.match(source, /const CACHE_SECONDS = 3600/)
  assert.doesNotMatch(source, /next\/headers|await headers\(/)
})

test('CMS revalidation keeps the homepage and shared CMS tag fresh after quiz saves', async () => {
  const source = await readFile(new URL('../app/api/revalidate/route.js', import.meta.url), 'utf8')

  assert.match(source, /revalidatePath\(path\)/)
  assert.match(source, /revalidateTag\('cms'\)/)
  assert.match(source, /'\/', '\/blog', '\/sitemap_index\.xml'/)
})

test('global redirect RPC migration is domain-scoped and public-read-only', async () => {
  const source = await readFile(
    new URL('../supabase/migrations/20260722_list_public_redirects.sql', import.meta.url),
    'utf8'
  )

  assert.match(source, /list_public_redirects\(domain text\)/)
  assert.match(source, /drop function if exists public\.list_public_redirects\(text\)/i)
  assert.match(source, /r\.website_id = public\.cms_public_website_id\(domain\)/)
  assert.match(source, /revoke all on function public\.list_public_redirects\(text\) from public/i)
  assert.match(source, /grant execute on function public\.list_public_redirects\(text\) to anon, authenticated/i)
})

test('global security headers include referrer and permissions policies', async () => {
  const source = await readFile(new URL('../next.config.js', import.meta.url), 'utf8')

  assert.match(source, /Referrer-Policy/)
  assert.match(source, /strict-origin-when-cross-origin/)
  assert.match(source, /Permissions-Policy/)
  assert.match(source, /camera=\(\), geolocation=\(\), microphone=\(\), payment=\(\), usb=\(\)/)
})
