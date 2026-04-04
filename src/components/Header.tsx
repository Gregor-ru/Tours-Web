'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Импортируем Image
import { Phone, Menu, X } from 'lucide-react'; // Убрали Mountain

const NAV_LINKS = [
  { href: '/tours', label: 'Все программы' },
  { href: '/about', label: 'О нас' },
  { href: '/contacts', label: 'Контакты' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Логотип */}
          <Link
            href="/tours"
            className="flex items-center gap-2 shrink-0 max-w-[60vw] sm:max-w-none group"
            onClick={() => setMobileOpen(false)}
          >
            {/* Обертка для логотипа */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <Image
                src="/logo.jpg" // Путь к файлу в папке public
                alt="Логотип"
                fill
                priority // Загружаем в первую очередь
                className="object-contain rounded-sm" // Сохраняем пропорции
              />
            </div>

            <div className="leading-tight overflow-hidden">
              <div className="font-bold text-[13px] sm:text-base text-gray-900 truncate">
                <span className="sm:hidden">Маршруты Егора Гребёнкина</span>
                <span className="hidden sm:inline">Авторские маршруты от Егора Гребёнкина</span>
              </div>
              <div className="text-gray-400 font-normal text-[11px]">Карелия и Ленобласть</div>
            </div>
          </Link>

          {/* ... остальная часть навигации без изменений ... */}
          <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-700 hover:text-[#E03C31] transition-colors font-medium whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="tel:+79968977532"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#E03C31] transition-colors whitespace-nowrap"
            >
              <Phone size={14} />
              +7 (996) 897-75-32
            </a>
            <a
              href="tel:+79968977532"
              className="md:hidden p-2 text-gray-600 hover:text-[#E03C31] transition-colors"
              aria-label="Позвонить"
            >
              <Phone size={20} />
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-[#E03C31] transition-colors"
              aria-label="Меню"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню (без изменений) */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-4 text-base text-gray-800 font-medium border-b border-gray-50 hover:bg-gray-50 hover:text-[#E03C31] transition-colors active:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+79968977532"
              className="px-5 py-4 text-base text-gray-800 flex items-center gap-2.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              <Phone size={16} className="text-[#E03C31]" />
              +7 (996) 897-75-32
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}