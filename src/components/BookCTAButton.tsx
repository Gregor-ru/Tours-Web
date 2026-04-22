'use client';

import { useBooking } from './TourBookingProvider';
import { reachGoal } from '@/lib/metrika';

interface Props {
  className?: string;
  label?: string;
}

export default function BookCTAButton({ className = '', label = 'Отправить заявку' }: Props) {
  const { selectedDate, selectedFormUrl, flashSidebar } = useBooking();

  const handleClick = () => {
    if (!selectedDate) {
      // Дата не выбрана — подсвечиваем сайдбар
      flashSidebar();
      return;
    }

    // Отправляем цель в Яндекс Метрику
    reachGoal('booking_click', { date: selectedDate });

    if (selectedFormUrl) {
      window.open(selectedFormUrl, '_blank');
    } else {
      alert('Форма для этой даты скоро появится! Напишите напрямую для записи.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-[#E03C31] hover:bg-[#C33529] active:scale-95 text-white font-semibold rounded-lg transition-all duration-150 ${className}`}
    >
      {selectedDate ? label : 'Выберите дату и запишитесь'}
    </button>
  );
}