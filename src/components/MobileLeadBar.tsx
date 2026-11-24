'use client';

import { useEffect, useState } from 'react';

// Нижняя панель на телефоне: цена и кнопка к форме заявки. Прячется, когда форма уже на экране.
export default function MobileLeadBar({ price, priceNote, label }: { price: number; priceNote?: string; label: string }) {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById('lead');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = () => {
    const el = document.getElementById('lead');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  };

  return (
    <div className={`lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-200 ${formVisible ? 'translate-y-full' : ''}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 leading-tight">{priceNote ?? 'Цена'}</div>
          <div className="text-xl font-bold text-gray-900 leading-tight">{price.toLocaleString('ru-RU')} ₽</div>
        </div>
        <button type="button" onClick={go}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-[#E03C31] hover:bg-[#C33529] text-white font-semibold text-sm active:scale-95 transition-transform">
          {label}
        </button>
      </div>
    </div>
  );
}
