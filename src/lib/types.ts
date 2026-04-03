export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface TourDate {
  start: string;
  end: string;
  formUrl?: string;
}

export interface TourFeature {
  title: string;
  description: string;
}

export interface HourlyItem {
  time: string;
  activity: string;
}

export interface TourDay {
  dayNumber: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  hourlySchedule?: HourlyItem[];
  image?: string;
  images?: string[]; // дополнительные фото дня
}

export interface EquipmentItem {
  name: string;
  required: boolean;
  note?: string;
}

export interface EquipmentSection {
  title: string;
  items: EquipmentItem[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PriceDetail {
  label: string;
  included: boolean;
}

export interface Tour {
  slug: string;
  title: string;
  region: string;
  country: string;
  tags: string[];
  price: number;
  coverImage: string;
  galleryImages: string[];
  description: string;
  additionalNote?: string;
  duration: number;
  distance: number;
  bagWeight: number;
  difficulty: Difficulty;
  maxPeople: number;
  instructor: string;
  instructorPhoto?: string;
  features: TourFeature[];
  dates: TourDate[];
  days: TourDay[];
  priceDetails: PriceDetail[];
  equipment: EquipmentSection[];
  faq: FAQ[];
}