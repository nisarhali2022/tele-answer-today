import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const metadata = buildMetadata({
  title: 'Corrections Policy',
  description:
    'How to report an error and how Tele Answer Today reviews and corrects published information.',
  path: '/corrections-policy',
})

export default function CorrectionsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Corrections Policy' }]}
        currentPath="/corrections-policy"
      />
      <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent">
        <h1>Corrections Policy</h1>
        <p>
          Accuracy matters to us. When a factual error is confirmed, we update
          the affected page as quickly as practical.
        </p>
        <h2>Reporting an error</h2>
        <p>
          Please use the <Link href="/contact-us">contact page</Link> and include
          the page URL, the statement you believe is incorrect, and a reliable
          source supporting the correction.
        </p>
        <h2>Our review process</h2>
        <p>
          We compare the report with primary or authoritative sources. Minor
          spelling and formatting fixes may be made directly; substantive
          factual corrections are reviewed before publication.
        </p>
      </article>
    </div>
  )
}
