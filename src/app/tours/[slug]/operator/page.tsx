import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { PROGRAMS, getProgram } from '@/data/programs';
import { TODO_OWNER } from '@/lib/programs';

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.filter((p) => p.operator).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgram(slug);
  return p ? { title: `Туроператор — ${p.title}` } : {};
}

export default async function OperatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const op = getProgram(slug)?.operator;
  if (!op) notFound();
  const rows: [string, string | null][] = [
    ['Туроператор', op.name],
    ['ИНН / ОГРН', op.innOgrn],
    ['Реестровый номер в Едином федеральном реестре туроператоров', op.registryNumber],
    ['Адрес', op.address],
    ['Финансовое обеспечение', op.financialSecurity],
    ['Контакты', op.contacts],
    ['Кто продаёт тур', op.sellerRole],
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Туроператор</h2>
      <p className="text-sm text-gray-500 mb-6">Сведения о туроператоре, который формирует этот тур.</p>

      <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3">
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className={`sm:col-span-2 text-sm ${value ? 'text-gray-900' : 'text-amber-800'}`}>
              {value ?? TODO_OWNER}
            </dd>
          </div>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3">
          <dt className="text-sm text-gray-500">Запись в реестре</dt>
          <dd className="sm:col-span-2 text-sm">
            {op.registryUrl ? (
              <a href={op.registryUrl} target="_blank" rel="noopener noreferrer" className="underline">Открыть запись</a>
            ) : (
              <span className="text-amber-800">{TODO_OWNER}</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {op.document ? (
          <a href={op.document.href} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
            <FileText size={16} /> {op.document.label}
          </a>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
            <FileText size={22} className="mx-auto mb-2" />
            Здесь будет скан свидетельства или выписка из реестра: {TODO_OWNER}
          </div>
        )}
      </div>
    </div>
  );
}
