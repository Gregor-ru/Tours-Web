import Link from 'next/link';
import Image from 'next/image';
import { Check, X, ChevronRight } from 'lucide-react';
import { yastrebinoe } from '@/data/tours/yastrebinoe';
import TourGallery from '@/components/TourGallery';
import TourTabs from '@/components/TourTabs';
import TourDayPlan from '@/components/TourDayPlan';
import TourFAQ from '@/components/TourFAQ';
import TourEquipment from '@/components/TourEquipment';
import BookCTAButton from '@/components/BookCTAButton';
import { TourBookingProvider } from '@/components/TourBookingProvider';
import SidebarWrapper from '@/components/SidebarWrapper';
import MobileBookingSheet from '@/components/MobileBookingSheet';
import climbingIcon from '@/data/tours/climbing-equipment.png';

function SeaKnotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22C12 22 17 18 17 13C17 10 15 8 12 8C9 8 7 10 7 13C7 18 12 22 12 22Z" />
      <path d="M12 8C12 8 7 6 7 3C7 1 9 1 12 1C15 1 17 1 17 3C17 6 12 8 12 8Z" />
      <path d="M9.5 11.5C9.5 11.5 11 13 12 13C13 13 14.5 11.5 14.5 11.5" opacity="0.6" />
    </svg>
  );
}

const FEATURE_ICONS = ['🎒', '🏞️', '🏕️', '🧗', '⛰️', '🌲', '⚠️', null];

export default function YastrebinoePage() {
  const tour = yastrebinoe;

  return (
    <TourBookingProvider>
      {/* Галерея */}
      <TourGallery coverImage={tour.coverImage} images={tour.galleryImages} title={tour.title} />

      {/* Хлебные крошки */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link href="/tours" className="hover:text-[#E03C31] transition-colors whitespace-nowrap">Главная</Link>
            <ChevronRight size={11} className="flex-shrink-0" />
            <Link href="/tours" className="hover:text-[#E03C31] transition-colors whitespace-nowrap">Россия</Link>
            <ChevronRight size={11} className="flex-shrink-0" />
            <span className="text-gray-600 truncate">Карелия и Ленобласть</span>
          </nav>
        </div>
      </div>

      {/* Табы */}
      <TourTabs />

      {/*
        pb-28 lg:pb-8 — отступ снизу для мобильной панели записи
        чтобы последний контент не перекрывался sticky-баром
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="lg:col-span-2 min-w-0 space-y-10 sm:space-y-12">

            {/* Описание */}
            <section id="description">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
                {tour.title}
              </h1>

              {/* Теги — горизонтальный скролл */}
              <div
                className="flex gap-2 mb-5 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {tour.tags.map((tag) => (
                  <span key={tag} className="flex-shrink-0 text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1.5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Характеристики — сетка 2x2 на мобилке */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                {[
                  { label: 'Длительность', value: `${tour.duration} дня` },
                  { label: 'Маршрут', value: `${tour.distance} км` },
                  { label: 'Рюкзак', value: `${tour.bagWeight} кг` },
                  { label: 'Сложность', value: `${tour.difficulty}/5` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-lg font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Описание */}
              <div className="text-sm sm:text-base text-gray-700 leading-7 space-y-4">
                <p>{tour.description}</p>
                {tour.additionalNote && (
                  <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-4">
                    {tour.additionalNote}
                  </p>
                )}
              </div>

              {/* Фичи */}
              <div className="mt-7 sm:mt-8">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Вас ждут:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3 p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                      <div className="text-xl flex-shrink-0 mt-0.5">
                        {FEATURE_ICONS[idx] !== null ? FEATURE_ICONS[idx] : (
                          <div className="relative w-6 h-6">
                            <Image
                              src={climbingIcon}
                              alt="Снаряжение"
                              placeholder="blur"
                              fill
                              sizes="24px"
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA — скрыта на мобилке (там есть нижняя панель) */}
              <div className="hidden sm:block mt-8">
                <BookCTAButton className="w-full sm:w-auto px-8 py-3.5 text-sm" label="Отправить заявку" />
              </div>
            </section>

            {/* План по дням */}
            <section id="plan">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">План по дням</h2>
              <TourDayPlan days={tour.days} />
            </section>

            {/* Стоимость */}
            <section id="price">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">Стоимость</h2>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between gap-3">
                  <span className="text-gray-600 text-sm">Стоимость на человека</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 flex-shrink-0">
                    {tour.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {tour.priceDetails.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 px-4 sm:px-5 py-3">
                      {item.included ? (
                        <Check size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={15} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm flex-1 leading-snug ${item.included ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                      {item.included && (
                        <span className="text-xs text-green-600 font-medium bg-green-50 rounded px-1.5 py-0.5 flex-shrink-0">
                          включено
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 sm:p-5 border-t border-gray-200">
                  <BookCTAButton className="w-full sm:w-auto px-8 py-3.5 text-sm" label="Отправить заявку" />
                </div>
              </div>
            </section>

            {/* Список вещей */}
            <section id="equip">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Список вещей</h2>
              <p className="text-sm text-gray-500 mb-4 sm:mb-5">Обязательные и рекомендуемые вещи для похода.</p>
              <TourEquipment equipment={tour.equipment} />
            </section>

            {/* Вопросы */}
            <section id="questions">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">Частые вопросы</h2>
              <TourFAQ faq={tour.faq} />
            </section>
          </div>

          {/* ПРАВАЯ КОЛОНКА — только десктоп */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-[112px]">
              <SidebarWrapper tour={tour} />
            </div>
          </div>
        </div>
      </div>

      {/* Мобильная нижняя панель записи */}
      <MobileBookingSheet price={tour.price} dates={tour.dates} />
    </TourBookingProvider>
  );
}