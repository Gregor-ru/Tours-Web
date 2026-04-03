'use client';

import Image from 'next/image';
import { Difficulty, TourDate } from '@/lib/types';
import { useBooking } from './TourBookingProvider';

interface Props {
  price: number;
  dates: TourDate[];
  duration: number;
  distance: number;
  bagWeight: number;
  difficulty: Difficulty;
  maxPeople: number;
  instructor: string;
  instructorPhoto?: string;
  sidebarRefProp: React.RefObject<HTMLDivElement | null>;
}

const MONTHS_GEN = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} — ${e.getDate()} ${MONTHS_GEN[e.getMonth()]} ${e.getFullYear()}`;
  }
  return `${s.getDate()} ${MONTHS_GEN[s.getMonth()]} — ${e.getDate()} ${MONTHS_GEN[e.getMonth()]} ${e.getFullYear()}`;
}

function DifficultyDots({ value }: { value: Difficulty }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < value ? 'bg-[#E03C31]' : 'bg-gray-200'}`} />
      ))}
      <span className="ml-1 text-sm text-gray-600">{value}/5</span>
    </div>
  );
}

export default function TourSidebar(props: Props) {
  const { price, dates, difficulty, instructor, instructorPhoto, sidebarRefProp } = props;
  const { selectedDate, selectedFormUrl, setSelectedDate, flashSidebar } = useBooking();

  const handleBook = () => {
    if (!selectedDate) { flashSidebar(); return; }
    if (selectedFormUrl) {
      window.open(selectedFormUrl, '_blank');
    } else {
      alert('Форма для этой даты скоро появится! Напишите напрямую для записи.');
    }
  };

  return (
    <div ref={sidebarRefProp} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white" style={{ transition: 'box-shadow 0.2s ease' }}>
      {/* Цена */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Цена</div>
        <div className="text-3xl font-bold text-gray-900">
          {price.toLocaleString('ru-RU')} <span className="text-xl">₽</span>
        </div>
      </div>

      {/* Выбор даты */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">Выбрать дату</div>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {dates.map((d, idx) => {
            const isSelected = selectedDate === d.start;
            return (
              <label
                key={idx}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer border transition-all text-sm select-none ${
                  isSelected
                    ? 'border-[#E03C31] bg-red-50 text-[#E03C31] font-medium'
                    : 'border-gray-100 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="tour-date"
                  value={d.start}
                  checked={isSelected}
                  onChange={() => setSelectedDate(d.start, d.formUrl)}
                  className="accent-[#E03C31]"
                />
                {formatDateRange(d.start, d.end)}
              </label>
            );
          })}
        </div>
      </div>

      {/* Кнопка */}
      <div className="p-5 border-b border-gray-100">
        <button
          onClick={handleBook}
          className={`w-full py-3.5 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-150 ${
            selectedDate
              ? 'bg-[#E03C31] hover:bg-[#C33529] active:scale-95 cursor-pointer'
              : 'bg-gray-400 cursor-pointer hover:bg-gray-500'
          }`}
        >
          {selectedDate ? 'Отправить заявку' : 'Выберите дату выше'}
        </button>
        {!selectedDate && (
          <p className="text-xs text-gray-400 text-center mt-2">↑ Выберите дату для записи</p>
        )}
      </div>

      {/* Инструктор */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs text-gray-500 mb-2.5 uppercase tracking-wide font-medium">Инструктор</div>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {instructorPhoto ? (
              <Image src={instructorPhoto} alt={instructor} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-red-100 flex items-center justify-center">
                <span className="text-[#E03C31] font-bold text-sm">
                  {instructor.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            )}
          </div>
          <span className="font-medium text-sm text-gray-900">{instructor}</span>
        </div>
      </div>

      {/* Характеристики */}
      <div className="p-5">
        <div className="space-y-3">
          {[
            { label: 'Длительность', value: `${props.duration} дн.` },
            { label: 'Длина маршрута', value: `${props.distance} км` },
            { label: 'Вес рюкзака', value: `${props.bagWeight} кг` },
            { label: 'Макс. участников', value: `${props.maxPeople} чел.` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Сложность</span>
            <DifficultyDots value={difficulty} />
          </div>
        </div>
      </div>
    </div>
  );
}