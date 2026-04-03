import Link from 'next/link';
import { Mountain, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-[#E03C31] mb-3">
              <Mountain size={22} strokeWidth={2} />
              <span className="font-bold text-white text-base">Авторские маршруты</span>
            </div>
            <p className="text-sm leading-relaxed">
              Небольшие группы, опытный инструктор, настоящая природа Карелии и Ленинградской области.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tours" className="hover:text-white transition-colors">Все походы</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition-colors">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Связаться</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+799689787532" className="hover:text-white transition-colors flex items-center gap-2">
                  <Phone size={14} /> +7 (996) 897-75-32
                </a>
              </li>
              <li>
                <a href="mailto:i@egrebenkin.ru" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail size={14} /> i@egrebenkin.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-gray-600 text-center">
          © {new Date().getFullYear()} Авторские маршруты. Все права защищены.
        </div>
      </div>
    </footer>
  );
}