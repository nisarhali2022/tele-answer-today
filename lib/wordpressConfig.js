const DEFAULT_WORDPRESS_API_URL =
  'https://wp.teleanswertoday.pk/wp-json/wp/v2'

export const WORDPRESS_API_URL = (
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  DEFAULT_WORDPRESS_API_URL
).replace(/\/+$/, '')
