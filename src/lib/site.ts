// Адрес и название сайта — для поисковиков: sitemap, robots, canonical, Open Graph.
// Свой домен появится — задать NEXT_PUBLIC_SITE_URL в Vercel (без слэша на конце).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://gregor-travel.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'Авторские маршруты Егора Гребёнкина';

// Короткое описание для поисковой выдачи: первые ~160 символов текста, по границе слова.
export function snippet(text: string, max = 160): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,.;:\-–—]+$/, '') + '…';
}
