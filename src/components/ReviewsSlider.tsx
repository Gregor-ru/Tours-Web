'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ExternalLink, Star, X } from 'lucide-react';
import { MAX_REVIEW_PHOTOS, SOURCE_LABELS, formatReviewDate, type Review, type ReviewSource } from '@/data/reviews';

// Значок источника: цветная плашка с названием площадки (без логотипов).
const SOURCE_STYLE: Record<ReviewSource, string> = {
  site: 'bg-gray-100 text-gray-600',
  vk: 'bg-[#0077FF]/10 text-[#0062D1]',
  avito: 'bg-[#00AAFF]/10 text-[#0079B8]',
  yandex: 'bg-[#FC3F1D]/10 text-[#C42A0F]',
};

function SourceBadge({ source }: { source: ReviewSource }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${SOURCE_STYLE[source]}`}>
      {SOURCE_LABELS[source]}
    </span>
  );
}

interface Props {
  reviews: Review[];
  demo?: boolean; // образец для локального просмотра — на сайт не попадает
}

const LONG_TEXT = 280; // длиннее — сворачиваем с кнопкой «Читать полностью»

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function ReviewCard({ review, demo, onOpenPhoto }: { review: Review; demo?: boolean; onOpenPhoto: (i: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const photos = (review.photos ?? []).slice(0, MAX_REVIEW_PHOTOS);
  const long = review.text.length > LONG_TEXT;
  const external = review.source !== 'site' && review.url;

  // Клик по карточке внешнего отзыва открывает оригинал (кроме кликов по кнопкам и ссылкам внутри)
  const onCardClick = (e: React.MouseEvent) => {
    if (!external || (e.target as HTMLElement).closest('button, a')) return;
    window.open(review.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article onClick={onCardClick}
      className={`relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 ${external ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm transition' : ''}`}>
      {demo && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">пример</span>
      )}
      <header className="flex items-center gap-3">
        <div aria-hidden className="h-11 w-11 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
          {initials(review.name)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{review.name}</div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
            <SourceBadge source={review.source} />
            <span>{demo ? review.date : formatReviewDate(review.date)}</span>
          </div>
        </div>
        {review.rating && !demo && (
          <div className="ml-auto flex items-center gap-1 text-sm font-semibold text-gray-900" aria-label={`Оценка ${review.rating} из 5`}>
            <Star size={14} className="fill-[#E03C31] text-[#E03C31]" /> {review.rating}
          </div>
        )}
      </header>

      <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 ${long && !expanded ? 'line-clamp-5' : ''}`}>
        {review.text}
      </p>
      {long && (
        <button type="button" onClick={() => setExpanded((v) => !v)}
          className="mt-1 self-start text-sm font-medium text-[#C33529] hover:underline">
          {expanded ? 'Свернуть' : 'Читать полностью'}
        </button>
      )}

      {photos.length > 0 && (
        <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
          {photos.map((src, i) => (
            <button key={src} type="button" onClick={() => onOpenPhoto(i)}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E03C31]"
              aria-label={`Фото ${i + 1} из отзыва ${review.name}`}>
              <Image src={src} alt="" fill sizes="(min-width: 1024px) 12vw, 28vw" className="object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {external && (
        <a href={review.url} target="_blank" rel="noopener noreferrer"
          className={`${photos.length > 0 ? 'mt-3' : 'mt-auto pt-3'} inline-flex items-center gap-1 self-start text-xs font-medium text-gray-500 hover:text-gray-900`}>
          Открыть отзыв на {review.source === 'vk' ? 'ВКонтакте' : review.source === 'avito' ? 'Авито' : 'Яндекс Картах'} <ExternalLink size={12} />
        </a>
      )}
    </article>
  );
}

function Lightbox({ photos, index, onClose, onIndex }: { photos: string[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const prev = useCallback(() => onIndex((index - 1 + photos.length) % photos.length), [index, photos.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Фото из отзыва"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative h-[80vh] w-[92vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={photos[index]} alt="" fill sizes="92vw" className="object-contain" />
      </div>
      <button type="button" onClick={onClose} aria-label="Закрыть"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X size={22} /></button>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Предыдущее фото"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft size={26} /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Следующее фото"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight size={26} /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">{index + 1} / {photos.length}</div>
        </>
      )}
    </div>
  );
}

export default function ReviewsSlider({ reviews, demo }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ review: number; photo: number } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: reviews.length <= 1 });

  const updateEdges = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? el.clientWidth) + 16), behavior: 'smooth' });
  };

  if (reviews.length === 0) return null;
  const openPhotos = open ? (reviews[open.review].photos ?? []).slice(0, MAX_REVIEW_PHOTOS) : [];

  return (
    <section id="reviews" aria-label="Отзывы">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Отзывы <span className="text-base font-normal text-gray-400">{reviews.length}</span>
        </h2>
        {reviews.length > 1 && (
          <div className="hidden sm:flex gap-2">
            <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Предыдущие отзывы"
              className="rounded-full border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Следующие отзывы"
              className="rounded-full border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
      {demo && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Образец блока: виден только при локальном запуске (npm run dev). На сайте отзывы появятся, когда они будут добавлены скриптом review:add.
        </p>
      )}
      <div ref={track} onScroll={updateEdges}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
        {reviews.map((r, i) => (
          <div key={r.id} data-card className="w-[85%] flex-shrink-0 snap-start sm:w-[calc(50%-8px)]">
            <ReviewCard review={r} demo={demo} onOpenPhoto={(photo) => setOpen({ review: i, photo })} />
          </div>
        ))}
      </div>
      {open && openPhotos.length > 0 && (
        <Lightbox photos={openPhotos} index={open.photo} onClose={() => setOpen(null)}
          onIndex={(photo) => setOpen({ review: open.review, photo })} />
      )}
    </section>
  );
}
