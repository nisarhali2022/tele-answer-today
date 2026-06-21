import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getKarachiDateISO,
  getKarachiDayStartISO,
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
