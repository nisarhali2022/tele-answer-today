import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import { getPostBySlug, getRelatedPosts } from '@/lib/wordpress';
import { SITE_CONFIG } from '@/lib/constants';
import {
  getFirstCategory,
  truncateText,
  injectAdAfterFirstParagraph,
  getAuthorPath,
  getFeaturedImageUrl,
  getPostAuthor,
  normalizeWordPressContentLinks,
  optimizeContentImages,
  removeContentH1Blocks,
  toPlainText,
} from '@/lib/utils';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import FeaturedImage from '@/components/posts/FeaturedImage';
import AuthorBox from '@/components/posts/AuthorBox';
import PostMeta from '@/components/posts/PostMeta';
import PostCard from '@/components/posts/PostCard';
import TableOfContents from '@/components/posts/TableOfContents';
import { generateTocAndInjectIds } from '@/lib/toc';
import AdBanner from '@/components/ads/AdBanner';
import AdInArticle from '@/components/ads/AdInArticle';
import ShareButtons from '@/components/ui/ShareButtons';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { buildMetadata } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/schema';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { post_slug } = await params;
  const post = await getPostBySlug(post_slug);
  if (!post) return { title: 'Not Found | ' + SITE_CONFIG.siteName };

  const categorySlug = getFirstCategory(post)?.slug || 'uncategorized';
  const yoast = post.yoast_head_json;
  const title = yoast?.title || post.title?.rendered;
  const description =
    yoast?.description ||
    truncateText(post.excerpt?.rendered || post.content?.rendered || '', 160);
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultOgImage}`;
  return buildMetadata({
    title,
    description,
    path: `/${categorySlug}/${post_slug}`,
    type: 'article',
    image: imageUrl,
    publishedTime: post.date,
    modifiedTime: post.modified,
    absoluteTitle: Boolean(yoast?.title),
  });
}

export default async function PostPage({ params }) {
  const { slug, post_slug } = await params;

  const post = await getPostBySlug(post_slug);
  if (!post) notFound();

  const category = getFirstCategory(post);
  const categorySlug = category?.slug || 'uncategorized';

  if (slug !== categorySlug) {
    permanentRedirect(`/${categorySlug}/${post_slug}`);
  }

  const relatedPosts = category ? await getRelatedPosts(category.id, post.id, 3) : [];

  const postUrl = `${SITE_CONFIG.siteUrl}/${categorySlug}/${post_slug}`;

  const contentHtml = normalizeWordPressContentLinks(
    removeContentH1Blocks(post.content?.rendered || '')
  );
  const optimizedHtml = optimizeContentImages(contentHtml);
  const { modifiedHtml, toc } = generateTocAndInjectIds(optimizedHtml);
  const titleText = toPlainText(post.title?.rendered);
  const tocWithTitle = [{ id: 'article-title', text: titleText, level: 1 }, ...toc];
  const adMarker = '<!--AD_IN_ARTICLE-->';
  const contentWithAd = injectAdAfterFirstParagraph(modifiedHtml, adMarker);
  const [beforeAd, afterAd] = contentWithAd.split(adMarker);

  const author = getPostAuthor(post);
  const authorPath = getAuthorPath(author);
  const imageUrl = getFeaturedImageUrl(post);
  const description = truncateText(
    post.excerpt?.rendered || post.content?.rendered || '',
    160
  );
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${postUrl}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    headline: toPlainText(post.title?.rendered),
    description,
    datePublished: post.date,
    dateModified: post.modified,
    ...(imageUrl && { image: [imageUrl] }),
    author: {
      '@type': 'Person',
      name: toPlainText(author?.name || SITE_CONFIG.siteName),
      url: `${SITE_CONFIG.siteUrl}${authorPath}`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.siteUrl}/#organization`,
      name: SITE_CONFIG.siteName,
      url: SITE_CONFIG.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.logoUrl,
      },
    },
    inLanguage: 'en-PK',
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(category ? [{ label: category.name, href: `/${categorySlug}` }] : []),
    { label: toPlainText(post.title?.rendered) },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <article className="min-w-0">
            <Breadcrumbs
              items={breadcrumbItems}
              currentPath={`/${categorySlug}/${post_slug}`}
            />
            <h1
              id="article-title"
              className="font-heading font-bold text-3xl sm:text-4xl text-text-primary leading-tight mt-2 mb-4"
            >
              {titleText}
            </h1>
            <PostMeta post={post} showDate={false} />
            <div className="mt-5 mb-6"><FeaturedImage post={post} priority /></div>
            <TableOfContents toc={tocWithTitle} />
            <div className="article-content prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-accent" dangerouslySetInnerHTML={{ __html: beforeAd }} />
            <AdInArticle />
            {afterAd && <div className="article-content prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-accent hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-sm" dangerouslySetInnerHTML={{ __html: afterAd }} />}
            <AuthorBox post={post} />
            <div className="mt-8"><AdBanner position="after-content" /></div>
            <ShareButtons title={toPlainText(post.title?.rendered)} url={postUrl} />
            {relatedPosts.length > 0 && (
              <section className="mt-10">
                <h2 className="font-heading font-bold text-xl text-text-primary mb-5">Related Posts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedPosts.map((p) => (
                    <PostCard key={p.id} post={p} showDate={false} />
                  ))}
                </div>
              </section>
            )}
          </article>
          <Suspense fallback={<LoadingSpinner size="lg" className="py-10" />}><Sidebar /></Suspense>
        </div>
      </div>
    </>
  );
}
