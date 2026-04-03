import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Backpack } from 'lucide-react';
import { Tour } from '@/lib/types';

interface Props {
  tour: Tour;
}

export default function TourCard({ tour }: Props) {
  return (
    <Link href={`/tours/${tour.slug}`} className="group block">
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-white">
        {/* Обложка */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <Image
            src={tour.coverImage}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => {}}
          />
          {/* Бейдж сложности */}
          <div className="absolute top-3 left-3 bg-white/90 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
            Сложность {tour.difficulty}/5
          </div>
          {/* Цена */}
          <div className="absolute top-3 right-3 bg-[#E03C31] text-white rounded-full px-3 py-1 text-sm font-bold">
            {tour.price.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        {/* Контент */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug mb-3 group-hover:text-[#E03C31] transition-colors">
            {tour.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {tour.duration} дн.
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {tour.distance} км
            </span>
            <span className="flex items-center gap-1">
              <Backpack size={12} /> {tour.bagWeight} кг
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tour.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}