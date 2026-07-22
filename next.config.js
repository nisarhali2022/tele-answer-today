const { fetchCmsStaticRedirects } = require('./lib/staticRedirects.cjs')

function getSupabaseImagePattern() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (!supabaseUrl) return []

  try {
    const { protocol, hostname } = new URL(supabaseUrl)
    return [{
      protocol: protocol.replace(':', ''),
      hostname,
      pathname: '/storage/v1/object/public/cms-media/**',
    }]
  } catch {
    return []
  }
}

const supabaseImagePatterns = getSupabaseImagePattern()

async function getCmsBuildRedirects() {
  if (process.env.NODE_ENV !== 'production') return []

  return fetchCmsStaticRedirects({
    domain: process.env.CMS_SITE_DOMAIN,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 384, 420, 640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 384],
    qualities: [60, 70, 75],
    minimumCacheTTL: 86400,
    remotePatterns: supabaseImagePatterns,
  },
  async headers() {
    return [
      {
        source: '/(.*)\\.(css|css\\.map)$',
        headers: [
          { key: 'Content-Type', value: 'text/css' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
          },
        ],
      },
    ]
  },
  async redirects() {
    return getCmsBuildRedirects()
  },
}

module.exports = nextConfig
