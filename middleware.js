import { NextResponse } from 'next/server'
import { resolveCmsDomain } from '@/lib/cmsDomain'
import { isExcludedRedirectPath, normalizeRedirectPath } from '@/lib/redirects'

function getDomain(request) {
  return resolveCmsDomain(
    request.headers.get('x-forwarded-host') || request.headers.get('host'),
    process.env.CMS_SITE_DOMAIN || 'teleanswertoday.pk'
  )
}

async function getRedirect(domain, fromPath) {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !anonKey || !domain) return null

  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_public_redirect`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, from_path: normalizeRedirectPath(fromPath) }),
    })

    return response.ok ? response.json() : null
  } catch {
    // A redirect lookup must never make an otherwise valid public page fail.
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  if (isExcludedRedirectPath(pathname)) return NextResponse.next()

  const match = await getRedirect(getDomain(request), pathname)
  if (!match?.toUrl) return NextResponse.next()

  let destination
  try {
    destination = new URL(match.toUrl, request.url)
  } catch {
    return NextResponse.next()
  }

  destination.search = request.nextUrl.search
  return NextResponse.redirect(destination, match.redirectType === 302 ? 302 : 301)
}

export const config = { matcher: '/:path*' }
