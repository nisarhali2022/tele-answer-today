import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getKarachiDateISO,
  getKarachiDayStartISO,
  getKarachiSeoDateISO,
  getKarachiSeoDayStartISO,
} from '../lib/date.js'

test('Karachi date rolls over at 19:00 UTC', () => {
  assert.equal(
    getKarachiDateISO(new Date('2026-06-14T18:59:59Z')),
    '2026-06-14'
  )
  assert.equal(
    getKarachiDateISO(new Date('2026-06-14T19:00:00Z')),
    '2026-06-15'
  )
})

test('Karachi sitemap day start uses the correct offset', () => {
  assert.equal(
    getKarachiDayStartISO(new Date('2026-06-14T19:00:00Z')),
    '2026-06-15T00:00:00+05:00'
  )
})

test('Karachi SEO date rolls over three hours before visible date', () => {
  assert.equal(
    getKarachiDateISO(new Date('2026-06-20T15:59:59Z')),
    '2026-06-20'
  )
  assert.equal(
    getKarachiSeoDateISO(new Date('2026-06-20T15:59:59Z')),
    '2026-06-20'
  )
  assert.equal(
    getKarachiDateISO(new Date('2026-06-20T16:00:00Z')),
    '2026-06-20'
  )
  assert.equal(
    getKarachiSeoDateISO(new Date('2026-06-20T16:00:00Z')),
    '2026-06-21'
  )
})

test('Karachi SEO sitemap day start uses the early SEO date', () => {
  assert.equal(
    getKarachiSeoDayStartISO(new Date('2026-06-20T16:00:00Z')),
    '2026-06-21T00:00:00+05:00'
  )
})
