import {
  getSitemapPages,
  renderUrlSitemap,
  xmlResponse,
} from '@/lib/sitemap'

export async function GET() {
  const pages = await getSitemapPages()
  return xmlResponse(renderUrlSitemap(pages))
}
