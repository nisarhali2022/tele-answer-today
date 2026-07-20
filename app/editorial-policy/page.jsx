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

const PAGE_SLUG = 'editorial-policy'
const PAGE_LABEL = 'Editorial Policy'
const FALLBACK_DESCRIPTION = `Read the editorial policy for ${SITE_CONFIG.name}.`
const FALLBACK_CONTENT = `
  <p>We aim to publish clear, accurate, and useful quiz answers, telecom updates, technology news, and practical guides for readers in Pakistan.</p>
  <h2>Research and review</h2>
  <p>Content is checked against available primary sources, official announcements, and the relevant service or application before publication. Opinion and promotional claims are not presented as verified facts.</p>
  <h2>Updates and independence</h2>
  <p>Time-sensitive pages are reviewed when new information becomes available. Advertising does not determine editorial conclusions, and sponsored material must be identified clearly.</p>
  <h2>Corrections</h2>
  <p>Readers can report an error through our contact page. Confirmed factual errors are corrected promptly and material changes are reflected in the updated content.</p>
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

export default async function EditorialPolicyPage() {
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
