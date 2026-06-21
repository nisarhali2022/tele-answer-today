import { permanentRedirect } from 'next/navigation'

export function GET() {
  permanentRedirect('/sitemap_index.xml')
}
