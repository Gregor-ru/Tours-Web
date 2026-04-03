'use client';

import { useBooking } from './TourBookingProvider';
import TourSidebar from './TourSidebar';
import { Tour } from '@/lib/types';

export default function SidebarWrapper({ tour }: { tour: Tour }) {
  const { sidebarRef } = useBooking();

  return (
    <TourSidebar
      price={tour.price}
      dates={tour.dates}
      duration={tour.duration}
      distance={tour.distance}
      bagWeight={tour.bagWeight}
      difficulty={tour.difficulty}
      maxPeople={tour.maxPeople}
      instructor={tour.instructor}
      instructorPhoto={tour.instructorPhoto}
      sidebarRefProp={sidebarRef}
    />
  );
}