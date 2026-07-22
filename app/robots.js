import { SITE_CONFIG } from '@/lib/constants';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/preview/'],
    },
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap_index.xml`,
  };
}
