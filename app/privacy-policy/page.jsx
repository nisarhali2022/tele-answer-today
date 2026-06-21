import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import { SITE_CONFIG } from '@/lib/constants';
import {
  normalizeWordPressContentLinks,
  optimizeContentImages,
  toPlainText,
  truncateText,
} from '@/lib/utils';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata() {
  const page = await getPageBySlug('privacy-policy');
  const title = page?.title?.rendered
    ? toPlainText(page.title.rendered)
    : 'Privacy Policy';
  const description = page?.excerpt?.rendered
    ? truncateText(page.excerpt.rendered, 160)
    : `Read the privacy policy for ${SITE_CONFIG.siteName}`;

  return buildMetadata({
    title,
    description,
    path: '/privacy-policy',
    robots: { index: true, follow: true },
  });
}

export default async function PrivacyPolicyPage() {
  const page = await getPageBySlug('privacy-policy');
  if (!page) notFound();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={breadcrumbItems} currentPath="/privacy-policy" />

      <article>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary mt-2 mb-8">
          {toPlainText(page.title?.rendered)}
        </h1>

        <div
          className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-text-primary
            prose-a:text-accent hover:prose-a:underline
            prose-img:rounded-lg prose-img:shadow-sm
            prose-blockquote:border-l-4 prose-blockquote:border-accent
            prose-blockquote:text-text-secondary
            prose-table:text-sm
            prose-th:bg-surface prose-th:text-text-primary
            prose-td:border-border"
          dangerouslySetInnerHTML={{
            __html: optimizeContentImages(
              normalizeWordPressContentLinks(page.content?.rendered || '')
            ),
          }}
        />

        <p className="mt-10 text-xs text-text-secondary border-t border-border pt-4">
          Last updated:{' '}
          {new Intl.DateTimeFormat('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(page.modified))}
        </p>
      </article>
    </div>
  );
}
