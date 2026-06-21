import Link from 'next/link';
import { absoluteUrl } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/schema';
import { toPlainText } from '@/lib/utils';

export default function Breadcrumbs({ items, currentPath }) {
  // items = [{ label, href? }, ...] — last item has no href
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: toPlainText(item.label),
      item: absoluteUrl(item.href || currentPath || '/'),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary py-3">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="text-border select-none">›</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-primary font-medium truncate max-w-[70vw] sm:max-w-[420px] lg:max-w-[560px]">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
