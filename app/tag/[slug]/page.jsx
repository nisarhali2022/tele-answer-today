import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTagBySlug, getPosts } from '@/lib/wordpress';
import { EXCLUDED_CONTENT_SLUGS, SITE_CONFIG } from '@/lib/constants';
import PostGrid from '@/components/posts/PostGrid';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/navigation/Pagination';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AdBanner from '@/components/ads/AdBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  buildMetadata,
  canonicalPath,
  getTagDescription,
  isInvalidArchivePage,
  parsePageNumber,
} from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const currentPage = parsePageNumber(resolvedSearch?.page) || 1;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: 'Not Found | ' + SITE_CONFIG.siteName };

  const title =
    currentPage > 1 ? `${tag.name} - Page ${currentPage}` : tag.name;
  const description = getTagDescription(tag);

  return buildMetadata({
    title,
    description,
    path: `/tag/${slug}`,
    page: currentPage,
    robots: { index: false, follow: true },
  });
}

export default async function TagPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const currentPage = parsePageNumber(resolvedSearch?.page);
  if (!currentPage) notFound();

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const archive = await getPosts({
    page: currentPage,
    perPage: SITE_CONFIG.postsPerPage,
    tagId: tag.id,
    excludeSlugs: EXCLUDED_CONTENT_SLUGS,
  });
  if (isInvalidArchivePage(archive, currentPage)) notFound();
  const { posts, totalPages } = archive;
  const description = getTagDescription(tag);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: `Tag: ${tag.name}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs
        items={breadcrumbItems}
        currentPath={canonicalPath(`/tag/${slug}`, currentPage)}
      />

      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary">
          Tag: {tag.name}
        </h1>
        <p className="text-text-secondary mt-2 text-sm max-w-2xl">
          {description}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {tag.count} post{tag.count !== 1 ? 's' : ''}
        </p>
      </div>

      <AdBanner position="top" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <section>
          <PostGrid posts={posts || []} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/tag/${slug}`}
          />
        </section>

        <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
          <Sidebar />
        </Suspense>
      </div>
    </div>
  );
}
