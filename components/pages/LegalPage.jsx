import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/cms'
import { formatDate, prepareContent, toPlainText } from '@/lib/utils'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export default async function LegalPage({ slug, label }) {
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  const title = toPlainText(page.title) || label

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label }]}
        currentPath={`/${slug}`}
      />
      <article>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary mt-2 mb-8">
          {title}
        </h1>
        <div
          className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:text-text-secondary"
          dangerouslySetInnerHTML={{ __html: prepareContent(page.content) }}
        />
        {page.modified && (
          <p className="mt-10 border-t border-border pt-4 text-xs text-text-secondary">
            Last updated: {formatDate(page.modified)}
          </p>
        )}
      </article>
    </div>
  )
}
