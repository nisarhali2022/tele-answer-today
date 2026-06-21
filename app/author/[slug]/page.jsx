import { notFound } from 'next/navigation'
import {
  getAuthorBySlug,
  getPostsByAuthor,
} from '@/lib/wordpress'
import {
  buildMetadata,
  canonicalPath,
  isInvalidArchivePage,
  parsePageNumber,
} from '@/lib/seo'
import { serializeJsonLd } from '@/lib/schema'
import { SITE_CONFIG } from '@/lib/constants'
import { toPlainText } from '@/lib/utils'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import Pagination from '@/components/navigation/Pagination'
import PostGrid from '@/components/posts/PostGrid'

export const revalidate = 3600

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params
  const resolvedSearch = await searchParams
  const currentPage = parsePageNumber(resolvedSearch?.page) || 1
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Author Not Found' }

  const name = toPlainText(author.name)
  return buildMetadata({
    title: currentPage > 1 ? `${name} - Page ${currentPage}` : name,
    description:
      toPlainText(author.description) ||
      `Articles written by ${name} for ${SITE_CONFIG.name}.`,
    path: `/author/${slug}`,
    page: currentPage,
  })
}

export default async function AuthorPage({ params, searchParams }) {
  const { slug } = await params
  const resolvedSearch = await searchParams
  const currentPage = parsePageNumber(resolvedSearch?.page)
  if (!currentPage) notFound()

  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const archive = await getPostsByAuthor(
    author.id,
    currentPage,
    SITE_CONFIG.postsPerPage
  )
  if (isInvalidArchivePage(archive, currentPage)) notFound()

  const name = toPlainText(author.name)
  const description = toPlainText(author.description)
  const avatar =
    author.avatar_urls?.['96'] ||
    author.avatar_urls?.['48'] ||
    author.avatar_urls?.['24']
  const authorUrl = `${SITE_CONFIG.siteUrl}/author/${slug}`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${authorUrl}#person`,
    name,
    description: description || undefined,
    url: authorUrl,
    image: avatar || undefined,
    worksFor: { '@id': `${SITE_CONFIG.siteUrl}/#organization` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: name }]}
          currentPath={canonicalPath(`/author/${slug}`, currentPage)}
        />
        <header className="mb-8 flex items-start gap-5 rounded-lg border border-border bg-surface p-6">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="h-24 w-24 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Author
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-text-primary">
              {name}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-text-secondary">{description}</p>
            )}
          </div>
        </header>
        <PostGrid posts={archive.posts} showDate={false} />
        <Pagination
          currentPage={currentPage}
          totalPages={archive.totalPages}
          basePath={`/author/${slug}`}
        />
      </div>
    </>
  )
}
