'use client';

import { useRef, useState } from 'react';
import { CircleCheck, ImagePlus, LoaderCircle, Send, X } from 'lucide-react';
import { REVIEW_LIMITS, validateReview, type ReviewErrors } from '@/lib/review-form';

// Форма «Оставить отзыв». Отзыв уходит владельцу в Telegram на модерацию (/api/review),
// на сайте он появится после того, как владелец добавит его скриптом review:add.
// Фото перед отправкой сжимаются в браузере (до 1600 px, JPEG), чтобы уложиться в лимиты.

type Status = 'idle' | 'sending' | 'sent' | 'error';

const SERVER_ERRORS: Record<string, string> = {
  rate_limited: 'Слишком много отзывов подряд. Попробуй позже.',
  not_configured: 'Форма пока не подключена. Напиши мне напрямую, пожалуйста.',
  delivery_failed: 'Отзыв не дошёл. Попробуй ещё раз или напиши мне напрямую.',
  too_large: 'Фото слишком большие. Попробуй выбрать меньше.',
};

async function compress(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
  if (!blob) throw new Error('compress');
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

export default function ReviewForm({ program, programs }: { program: string; programs: { slug: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [prog, setProg] = useState(program);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [website, setWebsite] = useState(''); // honeypot
  const startedAt = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const markStart = () => {
    if (!startedAt.current) startedAt.current = Date.now();
  };

  async function addPhotos(list: FileList | null) {
    if (!list) return;
    setBusy(true);
    const room = REVIEW_LIMITS.photos - photos.length;
    const picked = Array.from(list).filter((f) => f.type.startsWith('image/')).slice(0, room);
    const ready: { file: File; preview: string }[] = [];
    for (const f of picked) {
      try {
        const file = await compress(f);
        ready.push({ file, preview: URL.createObjectURL(file) });
      } catch {
        setErrors((e) => ({ ...e, photos: 'Не получилось открыть одно из фото' }));
      }
    }
    setPhotos((p) => [...p, ...ready]);
    setBusy(false);
    if (fileInput.current) fileInput.current.value = '';
  }

  function removePhoto(i: number) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[i].preview);
      return p.filter((_, j) => j !== i);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending' || busy) return;
    const fields = { program: prog, name: name.trim(), text: text.trim() };
    const found = validateReview(fields, programs.map((p) => p.slug), photos.map((p) => p.file));
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    const body = new FormData();
    body.append('program', fields.program);
    body.append('name', fields.name);
    body.append('text', fields.text);
    body.append('website', website);
    body.append('fillMs', String(startedAt.current ? Date.now() - startedAt.current : 0));
    photos.forEach((p) => body.append('photos', p.file));

    setStatus('sending');
    try {
      const res = await fetch('/api/review', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
        return;
      }
      if (data.error === 'validation' && data.fields) setErrors(data.fields);
      setServerError(SERVER_ERRORS[data.error] ?? 'Что-то пошло не так. Проверь поля и попробуй ещё раз.');
      setStatus('error');
    } catch {
      setServerError('Нет связи с сервером. Проверь интернет и попробуй ещё раз.');
      setStatus('error');
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        Оставить отзыв
      </button>
    );
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CircleCheck className="mx-auto text-green-600 mb-3" size={36} />
        <p className="font-semibold text-gray-900">Спасибо за отзыв!</p>
        <p className="text-sm text-gray-600 mt-1">Он появится на сайте после того, как я его прочитаю.</p>
      </div>
    );
  }

  const field =
    'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E03C31] focus:outline-none focus:ring-2 focus:ring-[#E03C31]/20';
  const err = (key: keyof ReviewErrors) =>
    errors[key] ? <p id={`review-${key}-error`} className="mt-1 text-xs text-[#C33529]">{errors[key]}</p> : null;

  return (
    <form onSubmit={onSubmit} onFocusCapture={markStart} onPointerDownCapture={markStart} noValidate
      className="relative rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900">Оставить отзыв</h3>
          <p className="text-sm text-gray-500 mt-0.5">Появится на сайте после того, как я его прочитаю.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть форму" className="p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="review-name" className="block text-sm font-medium text-gray-800 mb-1">Имя <span className="font-normal text-gray-400">(как показать на сайте)</span></label>
          <input id="review-name" className={field} value={name} onChange={(e) => setName(e.target.value)}
            maxLength={REVIEW_LIMITS.name} autoComplete="given-name" placeholder="Например, Анна" aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'review-name-error' : undefined} />
          {err('name')}
        </div>
        <div>
          <label htmlFor="review-program" className="block text-sm font-medium text-gray-800 mb-1">Программа</label>
          <select id="review-program" className={field} value={prog} onChange={(e) => setProg(e.target.value)} aria-invalid={!!errors.program}>
            {programs.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
          {err('program')}
        </div>
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-gray-800 mb-1">Отзыв</label>
        <textarea id="review-text" rows={5} className={field} value={text} onChange={(e) => setText(e.target.value)}
          maxLength={REVIEW_LIMITS.text} aria-invalid={!!errors.text} aria-describedby={errors.text ? 'review-text-error' : undefined} />
        {err('text')}
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-800 mb-1">Фото <span className="font-normal text-gray-400">- до {REVIEW_LIMITS.photos}, необязательно</span></span>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- локальное превью файла */}
              <img src={p.preview} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removePhoto(i)} aria-label={`Убрать фото ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={14} /></button>
            </div>
          ))}
          {photos.length < REVIEW_LIMITS.photos && (
            <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}
              className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600">
              {busy ? <LoaderCircle size={20} className="animate-spin" /> : <ImagePlus size={22} />}
              <span className="sr-only">Добавить фото</span>
            </button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple hidden
          onChange={(e) => addPhotos(e.target.files)} />
        {err('photos')}
      </div>

      {/* Honeypot: скрыто от людей */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Сайт<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#C33529]">{serverError}</p>}

      <button type="submit" disabled={status === 'sending' || busy}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E03C31] px-6 py-3 text-sm font-semibold text-white hover:bg-[#C33529] disabled:opacity-60">
        {status === 'sending' ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
        Отправить отзыв
      </button>
    </form>
  );
}
