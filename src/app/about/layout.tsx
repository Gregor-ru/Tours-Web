import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'О нас', alternates: { canonical: '/about' } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
