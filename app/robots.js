import { SITE_CONFIG } from '@/lib/constants';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap_index.xml`,
  };
}
