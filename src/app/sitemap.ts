import type { MetadataRoute } from 'next';
import { PROGRAMS } from '@/data/programs';
import { SITE_URL } from '@/lib/site';

// /sitemap.xml — список страниц для Яндекс Вебмастера и Google Search Console.
// Новая программа попадает сюда сама. Дата изменения — дата сборки сайта.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'weekly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page('/tours', 1),
    ...PROGRAMS.map((p) => page(`/tours/${p.slug}`, 0.9)),
    ...PROGRAMS.filter((p) => p.conditionsMd).map((p) => page(`/tours/${p.slug}/conditions`, 0.3, 'monthly')),
    page('/about', 0.6, 'monthly'),
    page('/contacts', 0.6, 'monthly'),
    page('/privacy', 0.1, 'yearly'),
    page('/consent', 0.1, 'yearly'),
  ];
}
