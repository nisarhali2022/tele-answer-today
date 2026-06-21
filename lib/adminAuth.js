import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'telenor_admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 8

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET is not configured.')
  return secret
}

function sign(value) {
  return createHmac('sha256', getAdminSecret()).update(value).digest('hex')
}

function valuesMatch(actual, expected) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  const payload = String(expiresAt)
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSessionToken(token) {
  if (!token) return false

  const [expiresAt, signature, ...extra] = token.split('.')
  if (!expiresAt || !signature || extra.length > 0) return false
  if (!/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false

  return valuesMatch(signature, sign(expiresAt))
}

export function isValidAdminSecret(candidate) {
  return (
    typeof candidate === 'string' &&
    candidate.length > 0 &&
    valuesMatch(candidate, getAdminSecret())
  )
}

export async function hasAdminSession() {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  )
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  }
}
