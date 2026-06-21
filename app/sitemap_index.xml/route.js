import { SITE_CONFIG } from '@/lib/constants'
import {
  getLatestLastModified,
  getSitemapCategories,
  getSitemapPages,
  getSitemapPosts,
  renderSitemapIndex,
  xmlResponse,
} from '@/lib/sitemap'

export async function GET() {
  const posts = await getSitemapPosts()
  const [pages, categories] = await Promise.all([
    getSitemapPages(),
    getSitemapCategories(posts),
  ])

  const sitemaps = [
    {
      loc: `${SITE_CONFIG.siteUrl}/post-sitemap.xml`,
      lastmod: getLatestLastModified(posts),
    },
    {
      loc: `${SITE_CONFIG.siteUrl}/page-sitemap.xml`,
      lastmod: getLatestLastModified(pages),
    },
    {
      loc: `${SITE_CONFIG.siteUrl}/category-sitemap.xml`,
      lastmod: getLatestLastModified(categories),
    },
  ]

  return xmlResponse(renderSitemapIndex(sitemaps))
}
