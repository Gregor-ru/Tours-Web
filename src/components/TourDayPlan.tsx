'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Clock, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { TourDay } from '@/lib/types';

interface Props {
  days: TourDay[];
}

interface LightboxState {
  isOpen: boolean;
  dayIndex: number;
  photoIndex: number;
}

export default function TourDayPlan({ days }: Props) {
  const [mode, setMode] = useState<'short' | 'full'>('short');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    dayIndex: 0,
    photoIndex: 0,
  });

  const getDayImages = (day: TourDay) => {
    const mainImg = day.image ? [day.image] : [];
    const extraImg = day.images || [];
    return [...mainImg, ...extraImg];
  };

  const openLightbox = (dayIdx: number, photoIdx: number = 0) => {
    const images = getDayImages(days[dayIdx]);
    if (images.length === 0) return;
    setLightbox({ isOpen: true, dayIndex: dayIdx, photoIndex: photoIdx });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
    document.body.style.overflow = 'unset';
  };

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox((prev) => {
      const imgs = getDayImages(days[prev.dayIndex]);
      return { ...prev, photoIndex: (prev.photoIndex + 1) % imgs.length };
    });
  }, [days]);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox((prev) => {
      const imgs = getDayImages(days[prev.dayIndex]);
      return { ...prev, photoIndex: (prev.photoIndex - 1 + imgs.length) % imgs.length };
    });
  }, [days]);

  // Клавиатура
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, nextPhoto, prevPhoto]);

  // Свайп в лайтбоксе
  const onLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onLightboxTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextPhoto() : prevPhoto();
    touchStartX.current = null;
  };

  return (
    <div>
      {/* Тоггл Кратко / Подробнее */}
      <div className="flex items-center gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {(['short', 'full'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'short' ? 'Кратко' : 'Подробнее'}
          </button>
        ))}
      </div>

      {/* Список всех дней */}
      <div className="flex flex-col gap-5 sm:gap-8">
        {days.map((day, dayIdx) => {
          const allDayImages = getDayImages(day);

          return (
            <div key={day.dayNumber} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {/* Заголовок */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <div className="w-8 h-8 rounded-full bg-[#E03C31] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {day.dayNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">День {day.dayNumber}</div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{day.title}</h3>
                </div>
              </div>

              {/* КРАТКО */}
              {mode === 'short' && (
                <div className="flex flex-col sm:grid sm:grid-cols-3">
                  {/* Фото */}
                  <div
                    className="relative sm:col-span-2 bg-gray-200 cursor-pointer group overflow-hidden"
                    style={{ height: 'clamp(180px, 50vw, 320px)' }}
                    onClick={() => openLightbox(dayIdx, 0)}
                  >
                    {day.image && !imgError[`${day.dayNumber}-main`] ? (
                      <>
                        <Image
                          src={day.image}
                          alt={day.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 66vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => setImgError((p) => ({ ...p, [`${day.dayNumber}-main`]: true }))}
                        />
                        {allDayImages.length > 1 && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 text-sm font-medium">
                              <ImageIcon size={16} />
                              {allDayImages.length} фото
                            </div>
                          </div>
                        )}
                        {/* На мобилке — всегда показываем счётчик фото если их много */}
                        {allDayImages.length > 1 && (
                          <div className="absolute bottom-3 right-3 sm:hidden bg-black/50 text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1">
                            <ImageIcon size={11} />
                            {allDayImages.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Фото дня {day.dayNumber}
                      </div>
                    )}
                  </div>
                  {/* Текст */}
                  <div className="p-4 sm:p-6 sm:col-span-1 flex items-center">
                    <p className="text-sm text-gray-600 leading-relaxed italic">{day.shortDescription}</p>
                  </div>
                </div>
              )}

              {/* ПОДРОБНЕЕ */}
              {mode === 'full' && (
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Главное фото */}
                  {day.image && (
                    <div
                      className="relative w-full rounded-xl overflow-hidden bg-gray-200 shadow-sm cursor-pointer group"
                      style={{ height: 'clamp(180px, 45vw, 380px)' }}
                      onClick={() => openLightbox(dayIdx, 0)}
                    >
                      {!imgError[`${day.dayNumber}-main-full`] ? (
                        <>
                          <Image
                            src={day.image}
                            alt={day.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 800px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgError((p) => ({ ...p, [`${day.dayNumber}-main-full`]: true }))}
                          />
                          {allDayImages.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 text-xs font-medium">
                              <ImageIcon size={13} />
                              Галерея ({allDayImages.length})
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Фото дня {day.dayNumber}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Доп. фото — горизонтальный скролл */}
                  {day.images && day.images.length > 0 && (
                    <div
                      className="flex gap-2 overflow-x-auto pb-1"
                      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                      {day.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => openLightbox(dayIdx, idx + 1)}
                          className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 ring-[#E03C31] transition-all active:scale-95"
                          style={{ width: 'clamp(64px, 18vw, 88px)', height: 'clamp(64px, 18vw, 88px)' }}
                        >
                          <Image
                            src={img}
                            alt={`Фото ${idx + 2}`}
                            fill
                            sizes="88px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Текст */}
                  <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                    {day.fullDescription.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Почасовое расписание */}
                  {day.hourlySchedule && day.hourlySchedule.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                      <h4 className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-4">
                        <Clock size={15} className="text-[#E03C31]" /> Программа дня
                      </h4>
                      <div className="border-l-2 border-gray-200 ml-2 space-y-0">
                        {day.hourlySchedule.map((item, i) => (
                          <div key={i} className="relative flex gap-3 pb-4 pl-5">
                            <div className="absolute left-[-5px] top-[5px] w-2.5 h-2.5 rounded-full bg-[#E03C31] border-2 border-white" />
                            <div className="text-xs font-mono text-[#E03C31] font-bold w-10 flex-shrink-0 pt-px">
                              {item.time}
                            </div>
                            <div className="text-sm text-gray-700 leading-snug">{item.activity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ЛАЙТБОКС */}
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeLightbox}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
        >
          {/* Верхняя панель */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-[110]">
            <div className="text-white/80 text-sm font-medium leading-snug pr-8">
              День {days[lightbox.dayIndex].dayNumber}: {days[lightbox.dayIndex].title}
            </div>
            <button
              className="text-white/70 hover:text-white p-1 flex-shrink-0"
              onClick={closeLightbox}
            >
              <X size={28} />
            </button>
          </div>

          {/* Стрелка назад — всегда видна */}
          <button
            className="absolute left-1 sm:left-4 text-white/60 hover:text-white z-[110] p-3"
            onClick={prevPhoto}
          >
            <ChevronLeft size={36} strokeWidth={1.5} />
          </button>

          {/* Фото */}
          <div
            className="relative w-full h-full px-12 sm:px-20 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ height: 'clamp(200px, 65vh, 680px)' }}>
              {(() => {
                const imgs = getDayImages(days[lightbox.dayIndex]);
                return (
                  <Image
                    src={imgs[lightbox.photoIndex]}
                    alt={`Фото дня ${days[lightbox.dayIndex].dayNumber}`}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    priority
                  />
                );
              })()}
            </div>
          </div>

          {/* Счётчик */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tracking-widest">
            {lightbox.photoIndex + 1}
            <span className="mx-2 text-white/30">/</span>
            {getDayImages(days[lightbox.dayIndex]).length}
          </div>

          {/* Стрелка вперёд — всегда видна */}
          <button
            className="absolute right-1 sm:right-4 text-white/60 hover:text-white z-[110] p-3"
            onClick={nextPhoto}
          >
            <ChevronRight size={36} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}