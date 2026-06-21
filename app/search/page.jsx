import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { searchPosts } from '@/lib/wordpress';
import { SITE_CONFIG } from '@/lib/constants';
import PostGrid from '@/components/posts/PostGrid';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/navigation/Pagination';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  buildMetadata,
  canonicalPath,
  isInvalidArchivePage,
  parsePageNumber,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const query = resolvedSearch?.q || '';
  const currentPage = parsePageNumber(resolvedSearch?.page) || 1;
  const title = query
    ? `Search Results for "${query}"${currentPage > 1 ? ` - Page ${currentPage}` : ''}`
    : 'Search';
  return buildMetadata({
    title,
    description: `Search results for "${query}" on ${SITE_CONFIG.siteName}`,
    path: '/search',
    page: currentPage,
    query: query ? { q: query } : {},
    robots: { index: false, follow: true },
  });
}

export default async function SearchPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const query = resolvedSearch?.q || '';
  const currentPage = parsePageNumber(resolvedSearch?.page);
  if (!currentPage) notFound();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Results' },
  ];

  if (!query.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Breadcrumbs items={breadcrumbItems} currentPath="/search" />
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
          What are you looking for?
        </h1>
        <p className="text-text-secondary">
          Enter a search term in the box above to find posts.
        </p>
      </div>
    );
  }

  const results = await searchPosts(query, currentPage);
  if (isInvalidArchivePage(results, currentPage)) notFound();
  const { posts, totalPages } = results;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs
        items={breadcrumbItems}
        currentPath={canonicalPath('/search', currentPage, { q: query })}
      />

      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-text-primary">
          Search Results for{' '}
          <span className="text-accent">&ldquo;{query}&rdquo;</span>
        </h1>
        {posts.length > 0 && (
          <p className="text-text-secondary text-sm mt-1">
            Showing page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">😔</p>
          <p className="font-heading font-bold text-xl text-text-primary mb-2">
            No results found
          </p>
          <p className="text-text-secondary text-sm">
            Try different keywords or browse our categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <section>
            <PostGrid posts={posts} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/search"
              query={{ q: query }}
            />
          </section>

          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
            <Sidebar />
          </Suspense>
        </div>
      )}
    </div>
  );
}
