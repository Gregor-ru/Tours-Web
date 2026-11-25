// Отзывы участников — одна лента из нескольких источников: сайт, ВКонтакте, Авито, Яндекс Карты.
// Сами записи лежат в src/data/reviews.json, фото — в public/images/reviews/<id>/ (у нас, не хотлинк).
// Добавлять и удалять — скриптом, руками JSON не править:
//   npm run review:add -- <ссылка> --program <slug>            (ВК: текст, имя, дата, фото — через VK API)
//   npm run review:add -- <ссылка> --name … --date … --text-file … --photos …  (Авито, Яндекс Карты)
//   npm run review:add -- --source site --program <slug> --name … --text-file …  (отзыв с сайта)
//   npm run review:remove -- <id>
// Аватары авторов не показываем и не храним — в карточке инициалы.
// Инструкция — ops/2026-11-24_otzyvy-skript.md. Не выдумывать отзывы.

import data from './reviews.json';

export type ReviewSource = 'site' | 'vk' | 'avito' | 'yandex';

export interface Review {
  id: string;
  source: ReviewSource;
  url?: string; // ссылка на оригинал; у отзывов с сайта нет
  program?: string; // slug программы; нет — общий отзыв, показывается у всех программ
  name: string; // только имя или «Имя Ф.» — полное ФИО не храним (скрипт сокращает сам)
  date: string; // ГГГГ-ММ-ДД — дата отзыва
  text: string;
  photos?: string[]; // локальные пути /images/reviews/…, не больше 3
  rating?: 1 | 2 | 3 | 4 | 5;
  test?: boolean; // тестовая запись — в коммит не попадает (скрипт удаляет: review:remove -- --tests)
}

export const MAX_REVIEW_PHOTOS = 3;

export const REVIEWS = data as Review[];

export const SOURCE_LABELS: Record<ReviewSource, string> = {
  site: 'Сайт',
  vk: 'ВКонтакте',
  avito: 'Авито',
  yandex: 'Яндекс Карты',
};

// Отзывы для страницы программы: свои + общие, новые сверху.
export function getReviews(slug: string): Review[] {
  return REVIEWS.filter((r) => !r.program || r.program === slug).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatReviewDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}
