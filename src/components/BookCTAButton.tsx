'use client';

import { useBooking } from './TourBookingProvider';

interface Props {
  className?: string;
  label?: string;
}

export default function BookCTAButton({ className = '', label = 'Отправить заявку' }: Props) {
  const { selectedDate, selectedFormUrl, flashSidebar } = useBooking();

  const handleClick = () => {
    if (!selectedDate) {
      flashSidebar();
      return;
    }
    if (selectedFormUrl) {
      window.open(selectedFormUrl, '_blank');
    } else {
      // Google Form ещё не создана — можно убрать когда появятся ссылки
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