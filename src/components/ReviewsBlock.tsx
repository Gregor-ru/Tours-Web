import { getReviews, type Review } from '@/data/reviews';
import ReviewsSlider from './ReviewsSlider';

// Отзывы внизу страницы программы. Нет отзывов — на сайте блока нет.
// При локальном запуске (npm run dev) вместо пустоты — образец с пометкой «пример»,
// чтобы видеть, как блок будет выглядеть. В сборку для сайта образец не попадает.
export default function ReviewsBlock({ slug, demoPhotos = [] }: { slug: string; demoPhotos?: string[] }) {
  const reviews = getReviews(slug);
  if (reviews.length > 0) return <ReviewsSlider reviews={reviews} />;
  if (process.env.NODE_ENV !== 'development') return null;

  const text = 'Здесь будет текст отзыва участника. ';
  const demo: Review[] = [
    { name: 'Имя Фамилия', avatar: null, date: 'месяц и год поездки', text: text.repeat(12).trim(), photos: demoPhotos.slice(0, 3) },
    { name: 'Имя Фамилия', avatar: null, date: 'месяц и год поездки', text: text.repeat(3).trim(), photos: demoPhotos.slice(1, 2) },
    { name: 'Имя Фамилия', avatar: null, date: 'месяц и год поездки', text: text.repeat(5).trim() },
  ];
  return <ReviewsSlider reviews={demo} demo />;
}
