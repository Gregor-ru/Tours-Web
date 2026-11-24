import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import type { Program } from '@/lib/programs';
import { ORGANIZERS } from '@/data/organizers';

export default function ProgramCard({ program: p }: { program: Program }) {
  const orgs = p.organizers.map((o) => ORGANIZERS[o.id].org);
  return (
    <Link href={`/tours/${p.slug}`} className="group block">
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-white h-full">
        <div className="relative h-48 bg-slate-700 overflow-hidden">
          {p.cover && (
            <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" />
          )}
          <div className="absolute top-3 left-3 bg-white/90 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">{p.kind}</div>
          <div className="absolute top-3 right-3 bg-[#E03C31] text-white rounded-full px-3 py-1 text-sm font-bold">
            {p.price.toLocaleString('ru-RU')} ₽{p.priceNote ? '*' : ''}
          </div>
          {p.draft && (
            <div className="absolute bottom-3 left-3 bg-amber-400 rounded-full px-2.5 py-1 text-xs font-semibold text-amber-950">скоро</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug mb-2 group-hover:text-[#E03C31] transition-colors">{p.title}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Calendar size={12} /> {p.datesLabel}
          </div>
          <div className="text-xs text-gray-400">{orgs.join(' · ')}</div>
        </div>
      </div>
    </Link>
  );
}
