const DEFAULT_WORDPRESS_API_URL =
  'https://wp.teleanswertoday.pk/wp-json/wp/v2'

function getWordPressImagePattern() {
  const apiUrl =
    process.env.WORDPRESS_API_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    DEFAULT_WORDPRESS_API_URL

  if (!apiUrl) return []

  try {
    const { protocol, hostname } = new URL(apiUrl)

    return [
      {
        protocol: protocol.replace(':', ''),
        hostname,
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'teleanswertoday.pk',
        pathname: '/wp-content/uploads/**',
      },
    ]
  } catch {
    return []
  }
}

const wordpressImagePatterns = getWordPressImagePattern()

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 384, 420, 640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 384],
    qualities: [60, 70, 75],
    minimumCacheTTL: 86400,
    remotePatterns: wordpressImagePatterns,
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
