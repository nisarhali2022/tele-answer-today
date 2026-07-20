import { getPageBySlug } from '@/lib/cms'
import {
  prepareContent,
  toPlainText,
  truncateText,
} from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const revalidate = 3600

const PAGE_SLUG = 'corrections-policy'
const PAGE_LABEL = 'Corrections Policy'
const FALLBACK_DESCRIPTION = `Read the corrections policy for ${SITE_CONFIG.name}.`
const FALLBACK_CONTENT = `
  <p>Accuracy matters to us. When a factual error is confirmed, we update the affected page as quickly as practical.</p>
  <h2>Reporting an error</h2>
  <p>Please use the contact page and include the page URL, the statement you believe is incorrect, and a reliable source supporting the correction.</p>
  <h2>Our review process</h2>
  <p>We compare the report with primary or authoritative sources. Minor spelling and formatting fixes may be made directly; substantive factual corrections are reviewed before publication.</p>
`

export async function generateMetadata() {
  const page = await getPageBySlug(PAGE_SLUG)
  const title = page?.title
    ? toPlainText(page.title)
    : PAGE_LABEL
  const description = page?.excerpt
    ? truncateText(page.excerpt, 160)
    : FALLBACK_DESCRIPTION

  return buildMetadata({ title, description, path: `/${PAGE_SLUG}` })
}

export default async function CorrectionsPolicyPage() {
  const page = await getPageBySlug(PAGE_SLUG)
  const pageTitle = toPlainText(page?.title) || PAGE_LABEL
  const content = page?.content || FALLBACK_CONTENT

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: PAGE_LABEL }]}
        currentPath={`/${PAGE_SLUG}`}
      />
      <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm">
        <h1>{pageTitle}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: prepareContent(content),
          }}
        />
      </article>
    </div>
  )
}
