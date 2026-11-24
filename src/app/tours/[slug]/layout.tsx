import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { PROGRAMS, getProgram } from '@/data/programs';
import { programSections } from '@/lib/programs';
import TourGallery from '@/components/TourGallery';
import ProgramNav from '@/components/ProgramNav';

// Общий шаблон всех программ: галерея → хлебные крошки → меню разделов → страница.
// Разделы страницы — src/app/tours/[slug]/page.tsx; пункты меню — programSections в src/lib/programs.ts.

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export default async function ProgramLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) notFound();

  return (
    <>
      {p.cover ? (
        <TourGallery coverImage={p.cover.src} images={p.gallery.map((g) => g.src)} title={p.cover.alt} />
      ) : (
        <div className="bg-slate-200" style={{ height: 'clamp(120px, 20vw, 220px)' }} aria-hidden />
      )}

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link href="/tours" className="hover:text-[#E03C31] transition-colors whitespace-nowrap">Все программы</Link>
            <ChevronRight size={11} className="flex-shrink-0" />
            <span className="whitespace-nowrap">{p.country}</span>
            <ChevronRight size={11} className="flex-shrink-0" />
            <span className="text-gray-600 truncate">{p.region}</span>
          </nav>
        </div>
      </div>

      <ProgramNav slug={p.slug} sections={programSections(p)} conditions={!!p.conditionsMd} operator={!!p.operator} />
      {children}
    </>
  );
}
