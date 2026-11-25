import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Контакты', alternates: { canonical: '/contacts' } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
