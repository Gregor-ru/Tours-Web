'use client';

import { useState, useEffect, useRef } from 'react';

const TABS = [
  { id: 'description', label: 'Описание' },
  { id: 'plan', label: 'План по дням' },
  { id: 'price', label: 'Стоимость' },
  { id: 'equip', label: 'Список вещей' },
  { id: 'questions', label: 'Вопросы' },
];

const OFFSET = 112;

export default function TourTabs() {
  const [activeTab, setActiveTab] = useState('description');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Следим за скроллом страницы
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + OFFSET + 40;
      let current = TABS[0].id;
      for (const tab of TABS) {
        const el = document.getElementById(tab.id);
        if (el && el.offsetTop <= scrollY) current = tab.id;
      }
      setActiveTab(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Автоскролл активного таба в видимую зону на мобилке
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (!activeBtn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    if (btnRect.left < containerRect.left + 10 || btnRect.right > containerRect.right - 10) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET - 8;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveTab(id);
  };

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto px-4 sm:px-6"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              data-tab={id}
              onClick={() => scrollTo(id)}
              // Минимум 44px высоты — стандарт Apple для touch-цели
              className={`flex-shrink-0 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#E03C31] text-[#E03C31]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}