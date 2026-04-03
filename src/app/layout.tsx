import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Авторские походы — Карелия и Ленобласть',
  description: 'Авторские туры и походы по Карелии и Ленинградской области. Скалолазание, палатки, природа.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        {/* viewport-fit=cover — контент под вырезом iPhone */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Цвет статус-бара iOS */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-[family-name:var(--font-inter)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}