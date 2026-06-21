import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPosts } from '@/lib/wordpress';
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
  isInvalidArchivePage,
  parsePageNumber,
} from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const currentPage = parsePageNumber(resolvedSearch?.page) || 1;
  const title = currentPage > 1 ? `Blog - Page ${currentPage}` : 'Blog';
  const description = `Read the latest news and articles on ${SITE_CONFIG.name}`;

  return buildMetadata({
    title,
    description,
    path: '/blog',
    page: currentPage,
  });
}

export default async function BlogPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const currentPage = parsePageNumber(resolvedSearch?.page);
  if (!currentPage) notFound();

  const archive = await getPosts({
    page: currentPage,
    perPage: SITE_CONFIG.postsPerPage,
    excludeSlugs: EXCLUDED_CONTENT_SLUGS,
  });
  if (isInvalidArchivePage(archive, currentPage)) notFound();
  const { posts, totalPages } = archive;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs
        items={breadcrumbItems}
        currentPath={canonicalPath('/blog', currentPage)}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary">
          Our Blog
        </h1>
        <p className="text-text-secondary mt-2 text-sm max-w-2xl">
          Latest news, updates, and articles.
        </p>
      </div>

      <AdBanner position="top" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <section>
          <PostGrid posts={posts} showDate={false} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/blog"
          />
        </section>

        <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
          <Sidebar />
        </Suspense>
      </div>
    </div>
  );
}
