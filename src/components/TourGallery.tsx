'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  coverImage: string;
  images: string[];
  title: string;
}

export default function TourGallery({ coverImage, images, title }: Props) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const allImages = [coverImage, ...images];

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Клавиатура
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  // Свайп в лайтбоксе
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextImage() : prevImage();
    touchStartX.current = null;
  };

  return (
    <div className="bg-white">
      {/* Главное фото */}
      <div
        className="relative w-full overflow-hidden cursor-zoom-in"
        style={{ height: 'clamp(200px, 45vw, 520px)' }}
        onClick={() => openLightbox(0)}
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors" />
        {/* Счётчик на мобилке */}
        <div className="absolute bottom-3 right-3 sm:hidden bg-black/50 text-white text-xs rounded-full px-2.5 py-1">
          {allImages.length} фото
        </div>
      </div>

      {/* Миниатюры */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx)}
              className="relative flex-shrink-0 rounded-xl overflow-hidden hover:ring-2 ring-[#E03C31] transition-all bg-gray-100 active:scale-95"
              style={{ width: 'clamp(56px, 15vw, 96px)', height: 'clamp(56px, 15vw, 96px)' }}
            >
              <Image
                src={img}
                alt={`Миниатюра ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Лайтбокс */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Закрыть */}
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white z-[110] p-2"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>

          {/* Стрелка назад — всегда видна на мобилке */}
          <button
            className="absolute left-2 sm:left-6 text-white/60 hover:text-white z-[110] p-3"
            onClick={prevImage}
          >
            <ChevronLeft size={36} strokeWidth={1.5} />
          </button>

          {/* Фото */}
          <div
            className="relative w-full h-full max-w-5xl px-14 sm:px-20 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ height: 'clamp(200px, 70vh, 700px)' }}>
              <Image
                src={allImages[currentIndex]}
                alt={`Фото ${currentIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Счётчик */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tracking-widest">
            {currentIndex + 1} <span className="mx-2 text-white/30">/</span> {allImages.length}
          </div>

          {/* Стрелка вперёд */}
          <button
            className="absolute right-2 sm:right-6 text-white/60 hover:text-white z-[110] p-3"
            onClick={nextImage}
          >
            <ChevronRight size={36} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}