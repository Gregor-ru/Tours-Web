import type { Program } from '@/lib/programs';

// Ледолазание на Беличьих скалах, февраль 2027.
// Факты: FACTS п. 14, 40, 58 (владелец 20.11 и 24.11.2026).
// Технику, страховку и организацию на льду не описываем — зона владельца.
export const iceClimbing: Program = {
  slug: 'ice-climbing',
  title: 'Ледолазание на Беличьих скалах',
  kind: 'Ледолазание',
  country: 'Россия',
  region: 'Ленинградская область',
  catalogGroup: 'Санкт-Петербург и Ленобласть',
  datesLabel: 'выходные февраля 2027',
  datesShort: 'февраль 2027',
  // Все субботы и воскресенья февраля 2027 (FACTS п. 40: «все выходные февраля, до 8 выездов»)
  dateOptions: [
    '6 февраля (сб)', '7 февраля (вс)',
    '13 февраля (сб)', '14 февраля (вс)',
    '20 февраля (сб)', '21 февраля (вс)',
    '27 февраля (сб)', '28 февраля (вс)',
  ],
  price: 4900,
  stats: [
    { label: 'Когда', value: 'февраль 2027' },
    { label: 'Длительность', value: '1 день' },
    { label: 'Выезд', value: 'из Петербурга' },
    { label: 'Группа', value: 'до 10 чел.' },
  ],
  summary: [
    'Однодневный выезд из Петербурга на Беличьи скалы под Выборгом. Под Петербургом лёд обычно встаёт только к февралю, поэтому выезжаем каждые выходные февраля.',
    'Ледовые инструменты и кошки - на каждого участника. Ботинки берём в аренду, они оплачиваются отдельно.',
  ],
  // Состав — владелец 24.11.2026 (FACTS п. 58)
  included: [
    'Ледовые инструменты и кошки - на каждого',
    'Трансфер Выборг - скалы и обратно',
    'Обед',
  ],
  notIncluded: ['«Ласточка» Петербург - Выборг и обратно', 'Аренда ботинок'],
  payment: 'предоплата 1 500 ₽ (около 30%)',
  bring: [
    'Термос с чаем',
    'Тёплую одежду, желательно со сменой',
    'Обязательно хорошую тёплую куртку - в ней стоишь, пока не лезешь, а стоять на улице очень холодно',
  ],
  // Время «Ласточек» — по памяти владельца (24.11.2026), сверить с расписанием перед публикацией
  program: [
    {
      dayNumber: 1,
      label: 'Один день · субботы и воскресенья февраля',
      title: 'Петербург - Беличьи скалы - Петербург',
      shortDescription: 'Утром на «Ласточке» до Выборга, оттуда трансфером к Беличьим скалам. Весь день лазаем по льду, обедаем, вечером возвращаемся в Петербург.',
      fullDescription: `Утром едем на «Ласточке» с Финляндского вокзала до Выборга. Точное время поезда пришлю перед выездом.

От Выборга - трансфером до Беличьих скал. Ледовые инструменты и кошки - на каждого, ботинки берём в аренду. Лазаем по льду, обедаем.

Вечером - трансфер в Выборг и «Ласточкой» обратно, в Петербурге около 22:00.`,
      hourlySchedule: [
        { time: '~8:00', activity: '«Ласточка» с Финляндского вокзала до Выборга' },
        { time: 'утро', activity: 'Трансфер от Выборга до Беличьих скал' },
        { time: 'день', activity: 'Лазаем по льду, обед' },
        { time: 'вечер', activity: 'Трансфер в Выборг и «Ласточка» в Петербург' },
        { time: '~22:00', activity: 'В Петербурге' },
      ],
      image: '/images/ice/photo1.webp',
      images: ['/images/ice/photo2.webp', '/images/ice/photo3.webp', '/images/ice/photo4.webp', '/images/ice/photo5.webp', '/images/ice/photo6.webp'],
    },
  ],
  organizers: [{ id: 'eg', role: 'организатор и инструктор', photo: null }],
  groupSize: 'до 10 человек',
  cover: { src: '/images/ice/cover.webp', alt: 'Ледопад среди елей' },
  gallery: [
    { src: '/images/ice/photo1.webp', alt: 'Ледолазы на замёрзшем водопаде' },
    { src: '/images/ice/photo2.webp', alt: 'Ледяная стена' },
    { src: '/images/ice/photo3.webp', alt: 'Ледолаз на льду' },
    { src: '/images/ice/photo4.webp', alt: 'Ледолаз на ледопаде над заснеженным лесом' },
    { src: '/images/ice/photo5.webp', alt: 'Ледолаз на ледопаде' },
    { src: '/images/ice/photo6.webp', alt: 'Замёрзший водопад и ледолаз' },
  ],
  // Временные фото со свободной лицензией (Wikimedia Commons), источники — photo-sources.md. Заменить своими.
  photoCredits: [
    { src: '/images/ice/cover.webp', what: 'обложка', author: 'Dwayne Reilander', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climbing_in_the_Canadian_Rockies_1_of_5_-_2022.jpg' },
    { src: '/images/ice/photo1.webp', what: 'Ледолазы на замёрзшем водопаде', author: 'Wilson Hui', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climbers_on_Frozen_Waterfall_-_Johnston_Canyon_(15634069953).jpg' },
    { src: '/images/ice/photo2.webp', what: 'Ледяная стена', author: 'Dwayne Reilander', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climbing_in_the_Canadian_Rockies_2_of_5_-_2022.jpg' },
    { src: '/images/ice/photo3.webp', what: 'Ледолаз на льду', author: 'Dwayne Reilander', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climbing_in_the_Canadian_Rockies_3_-_2022.jpg' },
    { src: '/images/ice/photo4.webp', what: 'Ледолаз на ледопаде над заснеженным лесом', author: 'Kristoffer Szilas (KSszilas)', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_climber_in_Norway.JPG' },
    { src: '/images/ice/photo5.webp', what: 'Ледолаз на ледопаде', author: 'Laurel F', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climber_Grotto_Falls_Canmore.jpg' },
    { src: '/images/ice/photo6.webp', what: 'Замёрзший водопад и ледолаз', author: 'Paul Guerin', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Ice_Climbing_Frozen_Waterfall_Gavarnie_France.jpg' },
  ],
  placeholders: [],
  notes: [
    {
      title: 'Если что-то пойдёт не так',
      text: 'Если ты отменяешь поездку меньше чем за неделю до выезда, предоплата не возвращается. Если лёд испортится или выезд в выбранные выходные не получится, предложу перенос на другие выходные или верну деньги.',
    },
  ],
};
