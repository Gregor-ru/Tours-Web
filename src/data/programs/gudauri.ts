import type { Program } from '@/lib/programs';
import { CONDITIONS_MD } from '@/data/legal';

// Гудаури 16–23.01.2027. Факты — docs/FACTS.md, п. 49, 53–57 (владелец, 23.11.2026).
export const gudauri: Program = {
  slug: 'gudauri',
  title: 'Горнолыжная неделя в Гудаури',
  kind: 'Горные лыжи и сноуборд',
  country: 'Грузия',
  region: 'Гудаури',
  catalogGroup: 'Грузия',
  datesLabel: '16–23 января 2027',
  datesShort: '16–23.01.2027',
  price: 55000,
  stats: [
    { label: 'Даты', value: '16–23 января' },
    { label: 'Сбор', value: 'Владикавказ' },
    { label: 'Катание', value: '6 дней' },
    { label: 'Группа', value: '8–12 чел.' },
  ],
  summary: [
    'Встречаемся 16 января в аэропорту Владикавказа и вместе едем в Гудаури. Живём в отеле на горе, катаемся 6 полных дней в свободном формате, 23 января рано утром возвращаемся во Владикавказ.',
    'Перелёт и скипасс покупаешь сам - так проще подобрать удобный рейс и абонемент.',
  ],
  included: [
    'Трансфер Владикавказ → Гудаури и обратно на заказном микроавтобусе',
    'Проживание 7 ночей в отеле на горе',
    'Завтраки',
    'Ужин в день заезда, 16 января',
  ],
  notIncluded: [
    'Перелёт до Владикавказа и обратно',
    'Скипасс (абонемент на подъёмники)',
    'Еда днём на горе и в кафе и ресторанах',
    'Алкоголь',
  ],
  payment: 'предоплата 30%, полная оплата до 5 января 2027',
  program: [
    {
      dayNumber: 1,
      label: 'День 1 · 16 января',
      title: 'Сбор во Владикавказе и дорога в горы',
      shortDescription: 'Встречаемся в аэропорту Владикавказа, около 2,5 часа едем на микроавтобусе в Гудаури, заселяемся в отель на горе и ужинаем.',
      fullDescription: `В 17:00 встречаемся в аэропорту Владикавказа. Рейс бери с прилётом до этого времени.

Дальше около 2,5 часа на заказном микроавтобусе до Гудаури. Заселяемся в отель на горе - по номерам расселяемся по желанию - и ужинаем. Ужин в этот день входит в стоимость.`,
      hourlySchedule: [
        { time: '17:00', activity: 'Встречаемся в аэропорту Владикавказа' },
        { time: '~2,5 ч', activity: 'Дорога до Гудаури на заказном микроавтобусе' },
        { time: 'вечер', activity: 'Заселение в отель на горе, ужин' },
      ],
      image: '/images/gudauri/photo1.webp',
    },
    {
      dayNumber: 2,
      badge: '2–7',
      label: 'Дни 2–7 · 17–22 января',
      title: '6 дней катания',
      shortDescription: 'Каждый день на склоне с 10 до 17, катаемся в свободном формате. Максим - инструктор по сноуборду, можно спросить у него совета.',
      fullDescription: `Шесть полных дней катания. Утром завтрак в отеле, к 10:00 - на склон, катаемся до 17:00 в свободном формате.

С нами Максим Слотин - инструктор по сноуборду категории B, на склоне можно спросить у него совета.

Скипасс покупаешь сам - на нужное число дней.`,
      hourlySchedule: [
        { time: '08:30', activity: 'Подъём' },
        { time: '09:30', activity: 'Завтрак в отеле, потом на склон' },
        { time: '10:00', activity: 'Катание в свободном формате' },
        { time: '17:00', activity: 'Окончание катания' },
      ],
      image: '/images/gudauri/photo2.webp',
      images: ['/images/gudauri/photo3.webp', '/images/gudauri/photo4.webp', '/images/gudauri/photo5.webp', '/images/gudauri/photo6.webp', '/images/gudauri/photo7.webp', '/images/gudauri/photo8.webp', '/images/gudauri/photo9.webp'],
    },
    {
      dayNumber: 8,
      label: 'День 8 · 23 января',
      title: 'Обратно во Владикавказ',
      shortDescription: 'Вечером 22-го собираем вещи, 23-го в 5 утра выезжаем и к 7–8 утра мы во Владикавказе. Рейс домой - не раньше 12:00.',
      fullDescription: `Вечером 22 января, после последнего дня катания, собираем вещи.

23 января в 5:00 выезжаем из отеля и в 7:00–8:00 мы во Владикавказе. Рейс домой бери не раньше 12:00.`,
      hourlySchedule: [
        { time: '22.01', activity: 'Вечером после катания - сборы' },
        { time: '05:00', activity: 'Выезд из отеля' },
        { time: '07:00', activity: 'Во Владикавказе (7:00–8:00)' },
        { time: '12:00', activity: 'Рейс домой - не раньше этого времени' },
      ],
      image: '/images/gudauri/cover.webp',
      images: ['/images/gudauri/photo10.webp'],
    },
  ],
  organizers: [
    { id: 'eg', role: 'организатор', photo: null },
    { id: 'severny', role: 'организатор, инструктор по сноуборду категории B', photo: null },
  ],
  groupSize: '8–12 человек',
  cover: { src: '/images/gudauri/cover.webp', alt: 'Заснеженные вершины над Гудаури' },
  gallery: [
    { src: '/images/gudauri/photo1.webp', alt: 'Гудаури: отели у подножия заснеженных гор' },
    { src: '/images/gudauri/photo2.webp', alt: 'Склон и подъёмники Гудаури' },
    { src: '/images/gudauri/photo3.webp', alt: 'Вид со склона на долину' },
    { src: '/images/gudauri/photo4.webp', alt: 'Ратрак-трасса и хребет' },
    { src: '/images/gudauri/photo5.webp', alt: 'Заснеженные гребни над Гудаури' },
    { src: '/images/gudauri/photo6.webp', alt: 'Плато под вершинами Гудаури' },
    { src: '/images/gudauri/photo7.webp', alt: 'Кресельный подъёмник над склоном' },
    { src: '/images/gudauri/photo8.webp', alt: 'Лыжники на склоне' },
    { src: '/images/gudauri/photo9.webp', alt: 'Отели и подъёмники Гудаури' },
    { src: '/images/gudauri/photo10.webp', alt: 'Долина и посёлок у курорта' },
  ],
  // Временные фото со свободной лицензией (Wikimedia Commons), источники — photo-sources.md. Заменить своими.
  photoCredits: [
    { src: '/images/gudauri/cover.webp', what: 'обложка', author: 'Alexey Okhrimenko', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_Ski_Resort,_Gudauri,_Georgia_(Unsplash).jpg' },
    { src: '/images/gudauri/photo1.webp', what: 'Гудаури: отели у подножия заснеженных гор', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(10).jpg' },
    { src: '/images/gudauri/photo2.webp', what: 'Склон и подъёмники Гудаури', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(8).jpg' },
    { src: '/images/gudauri/photo3.webp', what: 'Вид со склона на долину', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(24).jpg' },
    { src: '/images/gudauri/photo4.webp', what: 'Ратрак-трасса и хребет', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(14).jpg' },
    { src: '/images/gudauri/photo5.webp', what: 'Заснеженные гребни над Гудаури', author: 'Alexander Savonin', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Snow_on_a_mountain_in_Gudauri_(Unsplash).jpg' },
    { src: '/images/gudauri/photo6.webp', what: 'Плато под вершинами Гудаури', author: 'Levan Gokadze', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_ski_resort,_Georgia_04.jpg' },
    { src: '/images/gudauri/photo7.webp', what: 'Кресельный подъёмник над склоном', author: 'Levan Gokadze', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_ski_resort,_Georgia_03.jpg' },
    { src: '/images/gudauri/photo8.webp', what: 'Лыжники на склоне', author: 'Levan Gokadze', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_ski_resort,_Georgia_01.jpg' },
    { src: '/images/gudauri/photo9.webp', what: 'Отели и подъёмники Гудаури', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(11).jpg' },
    { src: '/images/gudauri/photo10.webp', what: 'Долина и посёлок у курорта', author: 'rugbyxm', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gudauri_(3).jpg' },
  ],
  placeholders: [],
  notes: [
    {
      // Цена с официального сайта оператора курорта (M.T.A.), FACTS п. 53. Проверено 23.11.2026:
      // прайс 2026/27 не опубликован. Когда появится — вписать цену на 6 дней и дату проверки.
      title: 'Скипасс',
      text: 'Цены на абонементы на сезон 2026/27 курорт пока не опубликовал (проверено 23.11.2026). Как только появятся - напишу здесь цену абонемента на 6 дней. Открытие сезона в Гудаури курорт объявил на 20.12.2026.',
      link: { href: 'https://mta.ski/en/prices-rules', label: 'mta.ski — официальный сайт горнолыжных курортов Грузии' },
    },
  ],
  conditionsMd: CONDITIONS_MD,
  // Вкладка «Туроператор» скрыта до решения владельца (24.11.2026: «на сайте пока не должно отображаться»).
  // Вернуть: добавить поле operator: { name, innOgrn, registryNumber, registryUrl, address,
  // financialSecurity, contacts, sellerRole, document } — шаблон страницы уже есть.
};
