import {
  getLatestLastModified,
  getSitemapPosts,
  renderUrlSitemap,
  xmlResponse,
} from '@/lib/sitemap'
import { SITE_CONFIG } from '@/lib/constants'

export async function GET() {
  const posts = await getSitemapPosts()
  const blogEntry = {
    loc: `${SITE_CONFIG.siteUrl}/blog`,
    lastmod: getLatestLastModified(posts),
    images: [],
  }

  return xmlResponse(renderUrlSitemap([blogEntry, ...posts]))
}
