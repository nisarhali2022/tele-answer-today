import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  getCategoryBySlug,
  getPageBySlug,
  getPostsByCategory,
  getAllCategorySlugs,
} from '@/lib/wordpress';
import { LEGACY_HOME_REDIRECT_SLUGS, SITE_CONFIG } from '@/lib/constants';
import PostGrid from '@/components/posts/PostGrid';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/navigation/Pagination';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AdBanner from '@/components/ads/AdBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import FeaturedImage from '@/components/posts/FeaturedImage';
import PostMeta from '@/components/posts/PostMeta';
import TableOfContents from '@/components/posts/TableOfContents';
import { generateTocAndInjectIds } from '@/lib/toc';
import AdInArticle from '@/components/ads/AdInArticle';
import ShareButtons from '@/components/ui/ShareButtons';
import {
  injectAdAfterFirstParagraph,
  normalizeWordPressContentLinks,
  optimizeContentImages,
  removeContentH1Blocks,
  toPlainText,
  truncateText,
} from '@/lib/utils';
import {
  buildMetadata,
  canonicalPath,
  getCategoryDescription,
  isInvalidArchivePage,
  parsePageNumber,
} from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  if (LEGACY_HOME_REDIRECT_SLUGS.includes(slug)) {
    return buildMetadata({
      title: SITE_CONFIG.siteName,
      description: SITE_CONFIG.description,
      path: '/',
    });
  }

  const resolvedSearch = await searchParams;
  const currentPage = parsePageNumber(resolvedSearch?.page) || 1;
  
  // 1. Is it a category?
  const category = await getCategoryBySlug(slug);
  if (category) {
    const title =
      currentPage > 1
        ? `${category.name} Archives - Page ${currentPage}`
        : `${category.name} Archives`;
    const description = getCategoryDescription(category);
    return buildMetadata({
      title,
      description,
      path: `/${slug}`,
      page: currentPage,
    });
  }

  // 2. Is it a page?
  const page = await getPageBySlug(slug);
  if (page) {
    const yoast = page.yoast_head_json;
    const title = yoast?.title || page.title?.rendered;
    const description =
      yoast?.description ||
      truncateText(page.excerpt?.rendered || page.content?.rendered || '', 160);
    const imageUrl = page._embedded?.['wp:featuredmedia']?.[0]?.source_url || `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultOgImage}`;
    return buildMetadata({
      title,
      description,
      path: `/${slug}`,
      type: 'article',
      image: imageUrl,
      publishedTime: page.date,
      modifiedTime: page.modified,
      absoluteTitle: Boolean(yoast?.title),
    });
  }

  return { title: 'Not Found | ' + SITE_CONFIG.siteName };
}

export default async function SlugPage({ params, searchParams }) {
  const { slug } = await params;
  if (LEGACY_HOME_REDIRECT_SLUGS.includes(slug)) {
    permanentRedirect('/');
  }

  // 1. Check if Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    const resolvedSearch = await searchParams;
    const currentPage = parsePageNumber(resolvedSearch?.page);
    if (!currentPage) notFound();
    const archive = await getPostsByCategory(category.id, currentPage, SITE_CONFIG.postsPerPage);
    if (isInvalidArchivePage(archive, currentPage)) notFound();
    const { posts, totalPages } = archive;
    const description = getCategoryDescription(category);

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: category.name },
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={breadcrumbItems}
          currentPath={canonicalPath(`/${slug}`, currentPage)}
        />
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary">{category.name}</h1>
          <p className="text-text-secondary mt-2 text-sm max-w-2xl">{description}</p>
          <p className="text-xs text-text-secondary mt-1">{category.count} post{category.count !== 1 ? 's' : ''}</p>
        </div>
        <AdBanner position="top" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <section>
            <PostGrid posts={posts} showDate={false} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/${slug}`} />
          </section>
          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    );
  }

  // 2. Check if Page
  const page = await getPageBySlug(slug);
  if (page) {
    const contentHtml = normalizeWordPressContentLinks(
      removeContentH1Blocks(page.content?.rendered || '')
    );
    const optimizedHtml = optimizeContentImages(contentHtml);
    const { modifiedHtml, toc } = generateTocAndInjectIds(optimizedHtml);
    const titleText = toPlainText(page.title?.rendered);
    const tocWithTitle = [{ id: 'article-title', text: titleText, level: 1 }, ...toc];
    const adMarker = '<!--AD_IN_ARTICLE-->';
    const contentWithAd = injectAdAfterFirstParagraph(modifiedHtml, adMarker);
    const [beforeAd, afterAd] = contentWithAd.split(adMarker);
    
    const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: toPlainText(page.title?.rendered) }];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <article className="min-w-0">
            <Breadcrumbs items={breadcrumbItems} currentPath={`/${slug}`} />
            <h1
              id="article-title"
              className="font-heading font-bold text-3xl sm:text-4xl text-text-primary leading-tight mt-2 mb-4"
            >
              {titleText}
            </h1>
            <PostMeta post={page} />
            <div className="mt-5 mb-6"><FeaturedImage post={page} priority /></div>
            <TableOfContents toc={tocWithTitle} />
            <div className="article-content prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-accent" dangerouslySetInnerHTML={{ __html: beforeAd }} />
            <AdInArticle />
            {afterAd && <div className="article-content prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm" dangerouslySetInnerHTML={{ __html: afterAd }} />}
            <div className="mt-8"><AdBanner position="after-content" /></div>
            <ShareButtons title={toPlainText(page.title?.rendered)} url={`${SITE_CONFIG.siteUrl}/${slug}`} />
          </article>
          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}><Sidebar /></Suspense>
        </div>
      </div>
    );
  }

  notFound();
}
