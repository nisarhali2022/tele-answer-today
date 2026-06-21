import {
  getSitemapCategories,
  renderUrlSitemap,
  xmlResponse,
} from '@/lib/sitemap'

export async function GET() {
  const categories = await getSitemapCategories()
  return xmlResponse(renderUrlSitemap(categories))
}
