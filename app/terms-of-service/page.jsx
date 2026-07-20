import LegalPage from '@/components/pages/LegalPage'
import { getPageBySlug } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { toPlainText, truncateText } from '@/lib/utils'

const SLUG = 'terms-of-service'
const TITLE = 'Terms of Service'
const DESCRIPTION = 'Read the Terms of Service for Tele Answer Today, including acceptable use, content limitations, user responsibilities, and platform rules.'

export const revalidate = 3600

export async function generateMetadata() {
  const page = await getPageBySlug(SLUG)
  return buildMetadata({
    title: toPlainText(page?.title) || TITLE,
    description: page?.excerpt ? truncateText(page.excerpt, 160) : DESCRIPTION,
    path: `/${SLUG}`,
  })
}

export default function TermsOfServicePage() {
  return <LegalPage slug={SLUG} label={TITLE} />
}
