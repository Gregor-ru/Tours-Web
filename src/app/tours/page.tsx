'use client';

import { yastrebinoe } from '@/data/tours/yastrebinoe';
import TourCard from '@/components/TourCard';
import { MapPin } from 'lucide-react';

export default function ToursPage() {
  const allTours = [yastrebinoe];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-7 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Все походы</h1>
        <p className="text-gray-500 text-sm sm:text-base">Авторские маршруты по Карелии и Ленинградской области</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={18} className="text-[#E03C31] flex-shrink-0" />
          <h2 className="text-lg font-bold text-gray-900">Россия</h2>
        </div>

        <div className="pl-4 sm:pl-6 border-l-2 border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Карелия и Ленобласть</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {allTours.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center py-10 sm:py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">Скоро здесь появятся новые маршруты</p>
      </div>
    </div>
  );
}