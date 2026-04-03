'use client';

import { createContext, useContext, useState, useRef, useCallback } from 'react';

interface BookingContextType {
  selectedDate: string | null;
  selectedFormUrl: string | null;
  setSelectedDate: (date: string | null, formUrl?: string) => void;
  flashSidebar: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}

const BookingContext = createContext<BookingContextType>({
  selectedDate: null,
  selectedFormUrl: null,
  setSelectedDate: () => {},
  flashSidebar: () => {},
  sidebarRef: { current: null },
});

export function useBooking() {
  return useContext(BookingContext);
}

export function TourBookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState<string | null>(null);
  const [selectedFormUrl, setSelectedFormUrl] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const setSelectedDate = useCallback((date: string | null, formUrl?: string) => {
    setSelectedDateState(date);
    setSelectedFormUrl(formUrl ?? null);
  }, []);

  const flashSidebar = useCallback(() => {
    const el = sidebarRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'box-shadow 0.2s ease';
    el.style.boxShadow = '0 0 0 4px #E03C31'; // Сделал чуть жирнее для заметности
    setTimeout(() => {
      if (el) el.style.boxShadow = '';
    }, 900); // Было 1400
  }, []);

  return (
    <BookingContext.Provider value={{ selectedDate, selectedFormUrl, setSelectedDate, flashSidebar, sidebarRef }}>
      {children}
    </BookingContext.Provider>
  );
}
