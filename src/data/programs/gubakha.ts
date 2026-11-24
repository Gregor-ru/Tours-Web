import type { Program } from '@/lib/programs';
import { GUBAKHA_CONDITIONS_MD } from '@/data/legal';

// Губаха из Кирова. Проводят Максим Слотин и СК «Северный» (FACTS п. 59, владелец 24.11.2026).
// Даты 2027 — выходные пт–вс (выезд в чт вечером), подтверждены владельцем 24.11.2026. Цена 25 000 ₽ — «лучше больше, чем меньше», финальная ❓.
export const gubakha: Program = {
  slug: 'gubakha',
  title: 'Горнолыжные выходные в Губахе из Кирова',
  kind: 'Горные лыжи и сноуборд',
  country: 'Россия',
  region: 'Пермский край',
  catalogGroup: 'Из Кирова',
  datesLabel: '4 выезда, январь–март 2027',
  datesShort: 'янв–мар 2027',
  dateOptions: [
    '29–31 января (выезд из Кирова 28.01)',
    '12–14 февраля (выезд из Кирова 11.02)',
    '26–28 февраля (выезд из Кирова 25.02)',
    '12–14 марта (выезд из Кирова 11.03)',
  ],
  price: 25000,
  priceNote: 'предварительная цена',
  stats: [
    { label: 'Когда', value: 'январь–март' },
    { label: 'Катание', value: '3 дня' },
    { label: 'Выезд', value: 'из Кирова' },
    { label: 'Группа', value: '10–20 чел.' },
  ],
  summary: [
    'Три дня катания в Губахе. Выезжаем из Кирова в четверг вечером на микроавтобусе, утром в пятницу уже на месте, в воскресенье вечером едем обратно и ночью возвращаемся в Киров.',
    'Выезд проводят Максим Слотин и спортивный комплекс «Северный».',
  ],
  included: ['Проезд Киров → Губаха → Киров на микроавтобусе', 'Проживание в доме', 'Завтраки и ужины'],
  notIncluded: ['Скипасс', 'Обеды и другая еда', 'Алкоголь'],
  // Оплата и возврат — как у Гудаури (владелец 24.11.2026). Срок полной оплаты «за 10 дней» — ❓ подтвердить
  payment: 'предоплата 30%, полная оплата не позже чем за 10 дней до выезда',
  program: [
    {
      dayNumber: 0,
      badge: 'чт',
      label: 'Четверг, вечер',
      title: 'Выезд из Кирова',
      shortDescription: 'Вечером выезжаем из Кирова на микроавтобусе, едем ночью.',
      fullDescription: 'Вечером в четверг выезжаем из Кирова на микроавтобусе и едем ночью - утром мы уже в Губахе.',
    },
    {
      dayNumber: 1,
      badge: 'пт',
      label: 'Пятница · день 1',
      title: 'Приезд, заселение и первый день катания',
      shortDescription: 'Утром мы в Губахе, с 9 до 10 заселяемся в дом и сразу едем кататься.',
      fullDescription: 'Утром приезжаем в Губаху. С 9:00 до 10:00 заселяемся в дом и едем на склон.',
      hourlySchedule: [
        { time: 'утро', activity: 'Приезд в Губаху' },
        { time: '09:00', activity: 'Заселение в дом (9:00–10:00)' },
        { time: 'день', activity: 'Катание' },
        { time: 'вечер', activity: 'Ужин' },
      ],
      image: '/images/gubakha/cover.webp',
    },
    {
      dayNumber: 2,
      badge: 'сб',
      label: 'Суббота · день 2',
      title: 'Катание',
      shortDescription: 'Завтрак, весь день на склоне, ужин.',
      fullDescription: 'Весь день на склоне. Завтрак и ужин входят в стоимость, обед - за свой счёт.',
      image: '/images/gubakha/photo1.webp',
    },
    {
      dayNumber: 3,
      badge: 'вс',
      label: 'Воскресенье · день 3',
      title: 'Катание и дорога домой',
      shortDescription: 'Катаемся, около 16–18 часов выезжаем в Киров, приезжаем ночью - примерно в 2–5 утра.',
      fullDescription: `Последний день катания. Около 16:00–18:00 выезжаем в Киров.

В Кирове - в ночь на понедельник, примерно в 2:00–5:00.`,
      hourlySchedule: [
        { time: 'день', activity: 'Катание' },
        { time: '16:00', activity: 'Выезд в Киров (16:00–18:00)' },
        { time: '02:00', activity: 'В Кирове (примерно 2:00–5:00, ночь на понедельник)' },
      ],
      image: '/images/gubakha/photo2.webp',
    },
  ],
  organizers: [{ id: 'severny', role: 'проводит выезд', photo: null }],
  groupSize: '10–20 человек',
  cover: { src: '/images/gubakha/cover.webp', alt: 'Склоны горнолыжного курорта Губаха' },
  gallery: [
    { src: '/images/gubakha/photo1.webp', alt: 'Гора Крестовая зимой' },
    { src: '/images/gubakha/photo2.webp', alt: 'Заснеженная вершина Крестовой горы' },
  ],
  // Временные фото со свободной лицензией (Wikimedia Commons), источники — photo-sources.md. Заменить своими.
  photoCredits: [
    { what: 'обложка', author: 'Soul Train', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Gubakha_Ski_resort.jpg' },
    { what: 'Гора Крестовая зимой', author: 'Tanya Chernushevich', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Зима_на_горе_Крестовой.jpg' },
    { what: 'Заснеженная вершина Крестовой горы', author: 'Andrei Chugunov', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Gubaha_140304_0013.jpg' },
  ],
  placeholders: [
    'Время и место сбора в Кирове',
    'Где дом и как размещаемся',
  ],
  conditionsMd: GUBAKHA_CONDITIONS_MD,
};
