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
  const [showError, setShowError] = useState(false); 
  const { selectedDate, selectedFormUrl, setSelectedDate } = useBooking();

  const selectedLabel = selectedDate
    ? (() => {
        const d = dates.find((d) => d.start === selectedDate);
        return d ? formatDateRange(d.start, d.end) : '';
      })()
    : null;

  const triggerError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 1300); // Было 2000
  };

  const handleBook = () => {
    if (!selectedDate) {
      triggerError();
      if (!sheetOpen) setSheetOpen(true);
      return;
    }
    if (selectedFormUrl) {
      window.open(selectedFormUrl, '_blank');
    } else {
      alert('Форма для этой даты скоро появится!');
    }
    setSheetOpen(false);
  };

  return (
    <>
      {/* 1. ПОДСВЕТКА ВНЕШНЕЙ ПЛАНКИ */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t transition-all duration-300 ${
          showError 
            ? 'border-red-500 shadow-[0_-10px_30px_rgba(224,60,49,0.3)]' // Усилили тень вверх
            : 'border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 leading-tight">Цена</div>
            <div className="text-xl font-bold text-gray-900 leading-tight">{price.toLocaleString('ru-RU')} ₽</div>
            {selectedLabel && (
              <div className="text-xs text-[#E03C31] leading-tight truncate">{selectedLabel}</div>
            )}
          </div>

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
              onClick={() => {
                setSheetOpen(true);
                triggerError();
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                showError ? 'bg-red-600 shadow-lg' : 'bg-[#E03C31]'
              } text-white`}
            >
              <ChevronUp size={16} />
              Выбрать дату
            </button>
          )}
        </div>
        <div className="h-safe-bottom bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>

      {sheetOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={() => setSheetOpen(false)} />

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-base">Выберите дату</h3>
              <button onClick={() => setSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {dates.map((d, idx) => {
                const isSelected = selectedDate === d.start;
                const label = formatDateRange(d.start, d.end);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.start, d.formUrl);
                      setSheetOpen(false);
                    }}
                    /* 2. ПОДСВЕТКА САМИХ КАРТОЧЕК ВНУТРИ */
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-300 text-left active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#E03C31] bg-red-50'
                        : showError
                        ? 'border-red-400 bg-red-50 shadow-[0_0_0_4px_rgba(224,60,49,0.1)]'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-sm ${isSelected ? 'text-[#E03C31]' : 'text-gray-900'}`}>
                        {label}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(d.end).getFullYear()}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={handleBook}
                className="w-full py-3.5 rounded-xl font-bold text-base transition-all bg-[#E03C31] text-white active:scale-[0.98]"
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