import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// /robots.txt — для Яндекса и Google: индексировать всё, кроме админки и служебных адресов.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
