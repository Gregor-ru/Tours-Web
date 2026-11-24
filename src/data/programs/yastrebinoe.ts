import type { Program } from '@/lib/programs';
import { yastrebinoe as tour } from '@/data/tours/yastrebinoe';

// Ястребиное — на общем шаблоне /tours/[slug]. Тексты, план по дням, вещи и вопросы берутся
// как есть из старого файла src/data/tours/yastrebinoe.ts (правки текста — там).
// Даты 2027 — FACTS п. 41 (владелец, 20.11.2026): май–июнь, по выходным; конкретных дат пока нет.
// Цена — как на старой странице (7 000 ₽). В FACTS на 2027 год: 7 500 / 8 000 ₽ — ждёт решения владельца.
export const yastrebinoe: Program = {
  slug: tour.slug,
  title: tour.title,
  kind: 'Поход и скалолазание',
  country: tour.country,
  region: tour.region,
  catalogGroup: 'Санкт-Петербург и Ленобласть',
  datesLabel: 'май–июнь 2027, по выходным',
  datesShort: 'май–июнь 2027',
  price: tour.price,
  stats: [
    { label: 'Длительность', value: `${tour.duration} дня` },
    { label: 'Маршрут', value: `${tour.distance} км` },
    { label: 'Рюкзак', value: `${tour.bagWeight} кг` },
    { label: 'Сложность', value: `${tour.difficulty}/5` },
  ],
  tags: tour.tags,
  summary: [tour.description, ...(tour.additionalNote ? [tour.additionalNote] : [])],
  features: tour.features,
  included: tour.priceDetails.filter((d) => d.included).map((d) => d.label),
  notIncluded: tour.priceDetails.filter((d) => !d.included).map((d) => d.label),
  equipment: tour.equipment,
  faq: tour.faq,
  program: tour.days,
  organizers: [{ id: 'eg', role: 'организатор и инструктор', photo: tour.instructorPhoto ?? null }],
  groupSize: `до ${tour.maxPeople} человек`,
  cover: { src: tour.coverImage, alt: 'Озеро Ястребиное' },
  gallery: tour.galleryImages.map((src, i) => ({ src, alt: `Ястребиное, фото ${i + 1}` })),
  photoCredits: [], // фото владельца
  placeholders: ['Конкретные даты выездов на 2027 год'],
};
