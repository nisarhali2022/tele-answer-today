export const WORDPRESS_API_URL = (
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  ''
).replace(/\/+$/, '')

if (!WORDPRESS_API_URL) {
  throw new Error(
    'WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL environment variable is required.'
  )
}
