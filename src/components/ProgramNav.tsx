'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Липкое меню страницы программы — одинаковое у всех туров.
// На странице тура пункты прокручивают к разделам и подсвечиваются при прокрутке;
// на вкладках «Условия участия» / «Туроператор» ведут обратно к нужному разделу.

interface NavSection {
  id: string;
  label: string;
}

const OFFSET = 120; // шапка сайта (64) + это меню (~48) + запас

export default function ProgramNav({ slug, sections, conditions, operator }: {
  slug: string;
  sections: NavSection[];
  conditions: boolean;
  operator: boolean;
}) {
  const pathname = usePathname();
  const base = `/tours/${slug}`;
  const onMain = pathname === base;
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onMain) return;
    const onScroll = () => {
      const y = window.scrollY + OFFSET + 40;
      let current = sections[0]?.id ?? '';
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onMain, sections]);

  // Активный пункт — в видимую зону меню на телефоне
  useEffect(() => {
    const box = scroller.current;
    const btn = box?.querySelector<HTMLElement>('[aria-current]');
    if (!box || !btn) return;
    const b = box.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    if (r.left < b.left + 10 || r.right > b.right - 10) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active, pathname]);

  const goTo = (e: React.MouseEvent, id: string) => {
    if (!onMain) return; // обычный переход по ссылке на страницу тура
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET + 8, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    setActive(id);
  };

  const cls = (on: boolean) =>
    `flex-shrink-0 whitespace-nowrap px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
      on ? 'border-[#E03C31] text-[#E03C31]' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    }`;

  return (
    <nav className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm" aria-label="Разделы программы">
      <div ref={scroller} className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar">
        {sections.map((s) => {
          const on = onMain && active === s.id;
          return (
            <a key={s.id} href={`${base}#${s.id}`} onClick={(e) => goTo(e, s.id)}
              aria-current={on ? 'true' : undefined} className={cls(on)}>
              {s.label}
            </a>
          );
        })}
        {conditions && (
          <Link href={`${base}/conditions`} aria-current={pathname === `${base}/conditions` ? 'page' : undefined}
            className={cls(pathname === `${base}/conditions`)}>
            Условия участия
          </Link>
        )}
        {operator && (
          <Link href={`${base}/operator`} aria-current={pathname === `${base}/operator` ? 'page' : undefined}
            className={cls(pathname === `${base}/operator`)}>
            Туроператор
          </Link>
        )}
      </div>
    </nav>
  );
}
