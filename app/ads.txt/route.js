import { getSiteSettings } from '@/lib/cms'
import { getAdSenseSettings } from '@/lib/cms/adsense'

export async function GET() {
  const adsTxt = getAdSenseSettings(await getSiteSettings()).adsTxt

  return new Response(adsTxt, {
    status: adsTxt ? 200 : 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
