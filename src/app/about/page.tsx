'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const photos = [
    '/images/egor.jpg',
    '/images/about/1.jpg',
    '/images/about/2.jpg',
    '/images/about/3.jpg',
    '/images/about/4.jpg',
    '/images/about/5.jpg',
    '/images/about/6.jpg',
    '/images/about/7.jpg',
    '/images/about/8.jpg',
  ];

  const nextPhoto = () => setCurrentIdx((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentIdx((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Заголовок */}
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-[#E03C31] font-semibold text-xs sm:text-sm uppercase tracking-widest mb-2">Знакомьтесь</p>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Ваш инструктор</h1>
      </div>

      {/* Основной блок */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">

        {/* Слайдер фото */}
        {/* Добавил mx-auto и ограничил ширину на мобилке до 280px (как на десктопе почти) */}
        <div className="w-[280px] sm:w-80 flex-shrink-0 group"> 
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-200 shadow-lg aspect-[3/4]" 
            // Убрали инлайновый стиль с height: clamp, теперь пропорции через aspect-ratio
          >
            <Image
              src={photos[currentIdx]}
              alt={`Егор Гребёнкин — фото ${currentIdx + 1}`}
              fill
              className="object-cover object-top transition-opacity duration-300"
              priority
            />

            {/* Стрелки — на мобилке всегда видны, на десктопе при наведении */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                onClick={prevPhoto}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white
                           opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/50 active:scale-95"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={nextPhoto}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white
                           opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/50 active:scale-95"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Точки-индикаторы */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`rounded-full transition-all ${
                    idx === currentIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="font-bold text-gray-900 text-lg">Егор Гребёнкин</div>
            <div className="text-sm text-gray-500">Инструктор по горному туризму</div>
          </div>
        </div>

        {/* Текст */}
        <div className="flex-1 space-y-4 sm:space-y-5">
          <div className="bg-[#E03C31]/5 border border-[#E03C31]/20 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            Заместитель руководителя горного направления в одном из студенческих турклубов Санкт-Петербурга.
          </div>

          <div className="space-y-4 text-sm sm:text-[15px] text-gray-700 leading-7">
            <p>
              Вот уже 10 лет я живу в горах и на скалах. Скалолазание, горный туризм, сплавы, каякинг и альпинизм стали частью меня. Я прошёл десятки маршрутов в самых разных уголках России: Алтай, Саяны, Хамар-Дабан, Кавказ, Карелия.
            </p>
            <p>
              Был руководителем пешего похода 2 категории сложности на Кавказе, участвовал в большом походе по Алтаю на 21 день автономки и поднимался на Эльбрус со своей командой. Два сезона работал рафт-гидом и инструктором по сплавам на Алтае.
            </p>
            <p>
              В Ленинградской области уже несколько сезонов веду коммерческие походы со скалолазанием.
            </p>
            <p>
              Выполнял I разряд по спортивному туризму и состоял в сборной Кировской области.
            </p>
            <p>
              У меня большой опыт работы со скальным и ледовым снаряжением, а также навыки организации спасательных работ. Но самое главное — я умею делать так, чтобы каждый участник чувствовал себя уверенно и в безопасности, независимо от уровня подготовки.
            </p>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-gray-700 font-medium mb-4 text-sm sm:text-base">Готовы отправиться в путешествие вместе?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tours"
                className="text-center bg-[#E03C31] hover:bg-[#C33529] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm active:scale-[0.98]"
              >
                Смотреть походы
              </Link>
              <Link
                href="/contacts"
                className="text-center border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm active:scale-[0.98]"
              >
                Написать мне
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}