// Раскладка фото программ: обложка, галерея и фото по дням.
// Хранится в src/data/photos.json и редактируется на странице /admin (владелец сам).
// Тексты программ остаются в src/data/programs/*.ts; фото оттуда перекрываются этим файлом.

import type { Photo, Program } from '@/lib/programs';

export interface DayPhotos {
  image: string | null; // главное фото дня
  images: string[]; // остальные фото дня
}

export interface ProgramPhotos {
  cover: Photo | null;
  gallery: Photo[];
  days: DayPhotos[]; // по порядку дней программы
}

export type PhotoLayout = Record<string, ProgramPhotos>;

export const PHOTO_LIMITS = { gallery: 60, dayImages: 12, alt: 200 };

// Путь к картинке сайта: только свои файлы из /images/, без внешних ссылок и обходов.
export function isSitePath(src: unknown): src is string {
  return typeof src === 'string' && /^\/images\/[\w\-./]+\.(jpe?g|png|webp|gif)$/i.test(src) && !src.includes('..');
}

function cleanPhoto(v: unknown): Photo | null {
  if (!v || typeof v !== 'object') return null;
  const { src, alt } = v as Record<string, unknown>;
  if (!isSitePath(src)) return null;
  return { src, alt: typeof alt === 'string' ? alt.trim().slice(0, PHOTO_LIMITS.alt) : '' };
}

// Проверка и нормализация раскладки одной программы (то, что прислала админка).
export function parseProgramPhotos(v: unknown, dayCount: number): ProgramPhotos | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const gallery = Array.isArray(o.gallery) ? o.gallery.map(cleanPhoto).filter((p): p is Photo => !!p) : [];
  const daysIn = Array.isArray(o.days) ? o.days : [];
  if (gallery.length > PHOTO_LIMITS.gallery) return null;
  const days: DayPhotos[] = Array.from({ length: dayCount }, (_, i) => {
    const d = (daysIn[i] ?? {}) as Record<string, unknown>;
    const images = Array.isArray(d.images) ? d.images.filter(isSitePath).slice(0, PHOTO_LIMITS.dayImages) : [];
    return { image: isSitePath(d.image) ? d.image : null, images };
  });
  return { cover: cleanPhoto(o.cover), gallery, days };
}

export function applyPhotos(p: Program, photos: ProgramPhotos | undefined): Program {
  if (!photos) return p;
  return {
    ...p,
    cover: photos.cover,
    gallery: photos.gallery,
    program: p.program.map((day, i) => {
      const d = photos.days[i];
      if (!d) return day;
      return { ...day, image: d.image ?? undefined, images: d.images.length ? d.images : undefined };
    }),
  };
}

// Все фото, которые сейчас используются в программе (для подписей к фото и выбора в админке).
export function usedPhotos(p: Program): string[] {
  const set = new Set<string>();
  if (p.cover) set.add(p.cover.src);
  p.gallery.forEach((g) => set.add(g.src));
  p.program.forEach((d) => {
    if (d.image) set.add(d.image);
    d.images?.forEach((s) => set.add(s));
  });
  return [...set];
}
