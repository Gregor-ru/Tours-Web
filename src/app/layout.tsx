import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YandexMetrika from '@/components/YandexMetrika';
import CookieNotice from '@/components/CookieNotice';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

// Подтверждение прав на сайт: коды из Яндекс Вебмастера и Google Search Console задаются
// переменными окружения в Vercel (YANDEX_VERIFICATION, GOOGLE_SITE_VERIFICATION), после — Redeploy.
// Инструкция — ops/2026-11-25_poiskoviki.md.
const verification: Metadata['verification'] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION?.trim() ? { google: process.env.GOOGLE_SITE_VERIFICATION.trim() } : {}),
  ...(process.env.YANDEX_VERIFICATION?.trim() ? { yandex: process.env.YANDEX_VERIFICATION.trim() } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Авторские походы — Карелия и Ленобласть',
    template: `%s — ${SITE_NAME}`,
  },
  description: 'Авторские туры и походы по Карелии и Ленинградской области. Скалолазание, палатки, природа.',
  openGraph: { type: 'website', locale: 'ru_RU', siteName: SITE_NAME },
  verification,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-[family-name:var(--font-inter)]">
        <YandexMetrika />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieNotice />
      </body>
    </html>
  );
}