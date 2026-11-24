// Отзывы участников — по программам (ключ — slug: 'yastrebinoe', 'gudauri', 'ice-climbing', 'gubakha').
// ТОЛЬКО настоящие отзывы и только с согласия автора на публикацию (имя, фото, текст —
// это персональные данные, см. legal/notes/2026-11-23_landing-pd.md). Не выдумывать.
//
// Как добавить отзыв:
//   1. Фото положить в public/images/reviews/<slug>/ (аватар — квадратный, фото — до 3 штук).
//   2. Добавить объект в массив нужной программы:
//      {
//        name: 'Имя Фамилия',
//        avatar: '/images/reviews/yastrebinoe/anna.jpg',   // или null — будут инициалы
//        date: 'июнь 2026',                               // когда был в поездке
//        text: 'Текст отзыва…',
//        photos: ['/images/reviews/yastrebinoe/anna-1.jpg'], // не больше 3, лишние не покажутся
//        rating: 5,                                        // необязательно, 1–5
//      },
// Пока у программы нет отзывов, блок «Отзывы» на сайте не показывается.

export interface Review {
  name: string;
  avatar: string | null;
  date: string;
  text: string;
  photos?: string[];
  rating?: 1 | 2 | 3 | 4 | 5;
}

export const MAX_REVIEW_PHOTOS = 3;

export const REVIEWS: Record<string, Review[]> = {
  yastrebinoe: [],
  gudauri: [],
  'ice-climbing': [],
  gubakha: [],
};

export function getReviews(slug: string): Review[] {
  return REVIEWS[slug] ?? [];
}
