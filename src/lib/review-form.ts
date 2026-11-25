// Отзыв из формы «Оставить отзыв»: общие лимиты и валидация для браузера и сервера.
// На сайт отзыв сразу не попадает — уходит владельцу в Telegram на модерацию,
// публикуется потом скриптом review:add (ops/2026-11-24_otzyvy-skript.md).

export const REVIEW_LIMITS = {
  name: 80,
  text: 3000,
  photos: 3,
  photoBytes: 1_500_000, // одно фото после сжатия в браузере
  totalBytes: 4_000_000, // всё тело запроса: у Vercel предел ~4,5 МБ
};

export const REVIEW_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ReviewFields {
  program: string;
  name: string;
  text: string;
}

export type ReviewErrors = Partial<Record<keyof ReviewFields | 'photos', string>>;

export function validateReview(f: ReviewFields, programs: string[], photos: { size: number; type: string }[]): ReviewErrors {
  const errors: ReviewErrors = {};
  if (!programs.includes(f.program)) errors.program = 'Выбери программу';
  if (f.name.length < 2) errors.name = 'Напиши, как тебя подписать';
  if (f.text.length < 10) errors.text = 'Напиши хотя бы пару предложений';
  if (photos.length > REVIEW_LIMITS.photos) errors.photos = `Не больше ${REVIEW_LIMITS.photos} фото`;
  else if (photos.some((p) => !REVIEW_PHOTO_TYPES.includes(p.type))) errors.photos = 'Фото - в формате JPG, PNG или WebP';
  else if (photos.some((p) => p.size > REVIEW_LIMITS.photoBytes)) errors.photos = 'Одно из фото слишком большое';
  return errors;
}
