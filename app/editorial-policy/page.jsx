import { buildMetadata } from '@/lib/seo'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const metadata = buildMetadata({
  title: 'Editorial Policy',
  description:
    'How Tele Answer Today researches, reviews, updates, and corrects published content.',
  path: '/editorial-policy',
})

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Editorial Policy' }]}
        currentPath="/editorial-policy"
      />
      <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent">
        <h1>Editorial Policy</h1>
        <p>
          We aim to publish clear, accurate, and useful quiz answers, telecom
          updates, technology news, and practical guides for readers in
          Pakistan.
        </p>
        <h2>Research and review</h2>
        <p>
          Content is checked against available primary sources, official
          announcements, and the relevant service or application before
          publication. Opinion and promotional claims are not presented as
          verified facts.
        </p>
        <h2>Updates and independence</h2>
        <p>
          Time-sensitive pages are reviewed when new information becomes
          available. Advertising does not determine editorial conclusions, and
          sponsored material must be identified clearly.
        </p>
        <h2>Corrections</h2>
        <p>
          Readers can report an error through our contact page. Confirmed
          factual errors are corrected promptly and material changes are
          reflected in the updated content.
        </p>
      </article>
    </div>
  )
}
