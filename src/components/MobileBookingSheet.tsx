'use client';

import { useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { useBooking } from './TourBookingProvider';
import { TourDate } from '@/lib/types';

const MONTHS_GEN = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} — ${e.getDate()} ${MONTHS_GEN[e.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS_GEN[s.getMonth()]} — ${e.getDate()} ${MONTHS_GEN[e.getMonth()]}`;
}

interface Props {
  price: number;
  dates: TourDate[];
}

export default function MobileBookingSheet({ price, dates }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { selectedDate, selectedFormUrl, setSelectedDate } = useBooking();

  const selectedLabel = selectedDate
    ? (() => {
        const d = dates.find((d) => d.start === selectedDate);
        return d ? formatDateRange(d.start, d.end) : '';
      })()
    : null;

  const handleBook = () => {
    if (!selectedDate) return;
    if (selectedFormUrl) {
      window.open(selectedFormUrl, '_blank');
    } else {
      alert('Форма для этой даты скоро появится! Напишите напрямую для записи.');
    }
    setSheetOpen(false);
  };

  return (
    <>
      {/* Sticky нижняя панель — только на мобилке */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Цена */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 leading-tight">Цена</div>
            <div className="text-xl font-bold text-gray-900 leading-tight">{price.toLocaleString('ru-RU')} ₽</div>
            {selectedLabel && (
              <div className="text-xs text-[#E03C31] leading-tight truncate">{selectedLabel}</div>
            )}
          </div>

          {/* Кнопки */}
          {selectedDate ? (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setSheetOpen(true)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium"
              >
                Изменить
              </button>
              <button
                onClick={handleBook}
                className="px-5 py-2.5 rounded-xl bg-[#E03C31] text-white font-semibold text-sm active:scale-95 transition-transform"
              >
                Записаться
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E03C31] text-white font-semibold text-sm active:scale-95 transition-transform"
            >
              <ChevronUp size={16} />
              Выбрать дату
            </button>
          )}
        </div>
        {/* Safe area для iPhone */}
        <div className="h-safe-bottom bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>

      {/* Шторка с датами */}
      {sheetOpen && (
        <>
          {/* Оверлей */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSheetOpen(false)}
          />

          {/* Нижняя шторка */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
            {/* Ручка */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Шапка шторки */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-base">Выберите дату</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Список дат — скроллится */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {dates.map((d, idx) => {
                const isSelected = selectedDate === d.start;
                const label = formatDateRange(d.start, d.end);
                const year = new Date(d.end).getFullYear();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.start, d.formUrl);
                      setSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#E03C31] bg-red-50'
                        : 'border-gray-100 bg-gray-50 active:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-sm ${isSelected ? 'text-[#E03C31]' : 'text-gray-900'}`}>
                        {label}
                      </div>
                      <div className="text-xs text-gray-400">{year}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#E03C31] flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Кнопка подтверждения */}
            <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={handleBook}
                disabled={!selectedDate}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all ${
                  selectedDate
                    ? 'bg-[#E03C31] text-white active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedDate ? 'Отправить заявку' : 'Выберите дату выше'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
