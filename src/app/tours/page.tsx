import type { Metadata } from 'next';
import { PROGRAMS } from '@/data/programs';
import ProgramCard from '@/components/ProgramCard';
import { MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Все программы',
  description: 'Походы, скалолазание, ледолазание и горные лыжи: выезды из Санкт-Петербурга и Кирова, Гудаури. Даты, цены, программа по дням.',
  alternates: { canonical: '/tours' },
};

// Разделы каталога — по полю catalogGroup («Раздел каталога» в админке), в порядке программ.
const GROUPS = [...new Set(PROGRAMS.map((p) => p.catalogGroup))];

export default function ToursPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-7 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Все программы</h1>
        <p className="text-gray-500 text-sm sm:text-base">Походы, скалы, лёд и горные лыжи</p>
      </div>

      {GROUPS.map((group) => {
        const programs = PROGRAMS.filter((p) => p.catalogGroup === group);
        if (programs.length === 0) return null;
        return (
          <div key={group} className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={18} className="text-[#E03C31] flex-shrink-0" />
              <h2 className="text-lg font-bold text-gray-900">{group}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {programs.map((p) => <ProgramCard key={p.slug} program={p} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
