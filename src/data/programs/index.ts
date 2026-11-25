import type { Program } from '@/lib/programs';
import { gudauri } from './gudauri';
import { iceClimbing } from './ice-climbing';
import { gubakha } from './gubakha';
import { yastrebinoe } from './yastrebinoe';
import photos from '../photos.json';
import { applyPhotos, type PhotoLayout } from '@/lib/photo-layout';

// Все программы, которые строятся по шаблону /tours/[slug].
// Новая программа: файл рядом + строка здесь. Порядок здесь = порядок в каталоге.
// Фото (обложка, галерея, фото по дням) — из src/data/photos.json, их меняет владелец на /admin.
// Фото в файлах программ ниже — запасные, на сайте не видны, пока программа есть в photos.json.
export const PROGRAMS: Program[] = [yastrebinoe, iceClimbing, gudauri, gubakha].map((p) =>
  applyPhotos(p, (photos as PhotoLayout)[p.slug]),
);

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
