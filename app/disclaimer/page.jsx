import LegalPage from '@/components/pages/LegalPage'
import { getPageBySlug } from '@/lib/cms'
import { buildMetadata, notFoundMetadata } from '@/lib/seo'
import { toPlainText, truncateText } from '@/lib/utils'

const SLUG = 'disclaimer'
const TITLE = 'Disclaimer'
const DESCRIPTION = 'Read the Tele Answer Today disclaimer about independent operation, informational content, reward guidance, and no affiliation with Telenor Pakistan.'

export const revalidate = 3600

export async function generateMetadata() {
  const page = await getPageBySlug(SLUG)
  if (!page) return notFoundMetadata('Disclaimer Not Found')
  return buildMetadata({
    title: toPlainText(page?.title) || TITLE,
    description: page?.excerpt ? truncateText(page.excerpt, 160) : DESCRIPTION,
    path: `/${SLUG}`,
  })
}

export default function DisclaimerPage() {
  return <LegalPage slug={SLUG} label={TITLE} />
}
