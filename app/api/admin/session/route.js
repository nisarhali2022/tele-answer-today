import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  hasAdminSession,
  isValidAdminSecret,
} from '@/lib/adminAuth'

export async function GET() {
  return NextResponse.json(
    { authenticated: await hasAdminSession() },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request) {
  try {
    const { secret } = await request.json()

    if (!isValidAdminSecret(secret)) {
      return NextResponse.json(
        { message: 'Invalid admin secret.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ authenticated: true })
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(),
      getAdminSessionCookieOptions()
    )
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return NextResponse.json(
      { message: 'Unable to authenticate.' },
      { status: 400 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
