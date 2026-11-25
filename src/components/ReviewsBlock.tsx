import { getReviews, type Review } from '@/data/reviews';
import { PROGRAMS } from '@/data/programs';
import ReviewsSlider from './ReviewsSlider';
import ReviewForm from './ReviewForm';

// Отзывы внизу страницы программы: одна лента из всех источников (сайт, ВК, Авито, Яндекс Карты)
// + кнопка «Оставить отзыв». Данные — src/data/reviews.json, добавляются скриптом review:add.
// При локальном запуске (npm run dev) и пустой ленте показывается образец с пометкой «пример».
export default function ReviewsBlock({ slug, demoPhotos = [] }: { slug: string; demoPhotos?: string[] }) {
  const programs = PROGRAMS.map((p) => ({ slug: p.slug, title: p.title }));
  const form = <ReviewForm program={slug} programs={programs} />;

  let reviews = getReviews(slug);
  let demo = false;
  if (reviews.length === 0 && process.env.NODE_ENV === 'development') {
    const text = 'Здесь будет текст отзыва участника. ';
    const base = { name: 'Имя Ф.', date: 'дата отзыва' };
    reviews = [
      { ...base, id: 'demo-1', source: 'vk', url: 'https://vk.com', text: text.repeat(12).trim(), photos: demoPhotos.slice(0, 3) },
      { ...base, id: 'demo-2', source: 'yandex', url: 'https://yandex.ru/maps', text: text.repeat(3).trim(), rating: 5 },
      { ...base, id: 'demo-3', source: 'site', text: text.repeat(5).trim(), photos: demoPhotos.slice(1, 2) },
      { ...base, id: 'demo-4', source: 'avito', url: 'https://www.avito.ru', text: text.repeat(2).trim() },
    ] satisfies Review[];
    demo = true;
  }

  if (reviews.length === 0) {
    return (
      <section id="reviews" aria-label="Отзывы">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Отзывы</h2>
        <p className="text-sm text-gray-500 mb-4">Отзывов пока нет. Расскажи, как прошла поездка.</p>
        {form}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <ReviewsSlider reviews={reviews} demo={demo} />
      {form}
    </div>
  );
}
