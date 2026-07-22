const RESERVED_REDIRECT_SOURCES = new Set([
  '/about',
  '/contact',
  '/sitemap.xml',
])

function normalizeSourcePath(value) {
  const source = String(value || '').trim()
  if (!source || !source.startsWith('/') || source.startsWith('//') || /[?#]/.test(source)) {
    throw new Error(`Invalid redirect source: ${source || '(empty)'}`)
  }

  const normalized = source === '/' ? '/' : source.replace(/\/+$/, '')
  if (RESERVED_REDIRECT_SOURCES.has(normalized)) {
    throw new Error(`Redirect source is reserved by the application: ${normalized}`)
  }

  return normalized || '/'
}

function normalizeDestination(value, domain) {
  const destination = String(value || '').trim()
  if (!destination || destination.startsWith('//')) {
    throw new Error(`Invalid redirect destination: ${destination || '(empty)'}`)
  }

  if (destination.startsWith('/')) {
    const url = new URL(destination, `https://${domain}`)
    url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '')
    url.hash = ''
    return `${url.pathname || '/'}${url.search}`
  }

  let url
  try {
    url = new URL(destination)
  } catch {
    throw new Error(`Invalid redirect destination: ${destination}`)
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  if (!['http:', 'https:'].includes(url.protocol) || hostname !== domain) {
    throw new Error(`Redirect destination must stay on ${domain}: ${destination}`)
  }

  url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '')
  url.hash = ''
  return `${url.pathname || '/'}${url.search}`
}

function normalizeRedirectType(value) {
  const redirectType = Number(value)
  if (redirectType !== 301 && redirectType !== 302) {
    throw new Error(`Unsupported redirect type: ${value}`)
  }
  return redirectType
}

function createStaticRedirects(records, domain) {
  const normalizedDomain = String(domain || '').trim().toLowerCase().replace(/^www\./, '')
  if (!normalizedDomain) {
    throw new Error('CMS_SITE_DOMAIN is required to build CMS redirects.')
  }

  const seenSources = new Set()
  return (Array.isArray(records) ? records : []).map((record) => {
    const source = normalizeSourcePath(record?.from_path || record?.fromPath)
    const destination = normalizeDestination(record?.to_url || record?.toUrl, normalizedDomain)
    const redirectType = normalizeRedirectType(record?.redirect_type ?? record?.redirectType)
    const destinationPath = destination.split('?')[0]

    if (source === destinationPath) {
      throw new Error(`Redirect loop detected for ${source}`)
    }
    if (seenSources.has(source)) {
      throw new Error(`Duplicate redirect source: ${source}`)
    }

    seenSources.add(source)
    return {
      source,
      destination,
      permanent: redirectType === 301,
    }
  })
}

async function fetchCmsStaticRedirects({ domain, supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  const normalizedUrl = String(supabaseUrl || '').replace(/\/$/, '')
  const key = String(supabaseAnonKey || '')
  if (!normalizedUrl || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to build CMS redirects.')
  }

  const response = await fetchImpl(`${normalizedUrl}/rest/v1/rpc/list_public_redirects`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`CMS redirect feed failed with ${response.status}.`)
  }

  const records = await response.json()
  if (!Array.isArray(records)) {
    throw new Error('CMS redirect feed returned an invalid response.')
  }

  return createStaticRedirects(records, domain)
}

module.exports = {
  RESERVED_REDIRECT_SOURCES,
  createStaticRedirects,
  fetchCmsStaticRedirects,
  normalizeDestination,
  normalizeRedirectType,
  normalizeSourcePath,
}
