import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SimpleMarkdown from '@/components/SimpleMarkdown';
import { PROGRAMS, getProgram } from '@/data/programs';

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.filter((p) => p.conditionsMd).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgram(slug);
  return p ? { title: `Условия участия — ${p.title}` } : {};
}

export default async function ConditionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p?.conditionsMd) notFound();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Условия участия</h2>
      <SimpleMarkdown source={p.conditionsMd} />
    </div>
  );
}
