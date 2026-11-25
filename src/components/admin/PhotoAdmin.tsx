'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Images, LoaderCircle, LogOut, Trash2, X } from 'lucide-react';
import type { PhotoLayout, ProgramPhotos } from '@/lib/photo-layout';

// Редактор фото программ: обложка, галерея наверху страницы, фото по дням.
// Новые фото сжимаются в браузере (до 2000 px, WebP/JPEG), уходят на сервер и попадают на сайт после «Сохранить».

interface ProgramInfo {
  slug: string;
  title: string;
  days: { label: string; title: string }[];
}

type Upload = { path?: string; sha?: string; preview: string };

const ERRORS: Record<string, string> = {
  unauthorized: 'Сессия закончилась - обнови страницу и войди снова.',
  not_configured: 'Хранилище не настроено (нет GITHUB_TOKEN / GITHUB_REPO).',
  too_large: 'Фото слишком большое даже после сжатия.',
  not_image: 'Это не фото (нужен JPG, PNG или WebP).',
  storage_failed: 'GitHub не ответил или отказал. Попробуй ещё раз; если повторится - проверь токен.',
  bad_layout: 'Сервер не принял раскладку.',
};

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82));
  if (webp && webp.type === 'image/webp') return webp;
  const jpg = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
  if (!jpg) throw new Error('compress');
  return jpg;
}

const move = <T,>(list: T[], i: number, dir: -1 | 1): T[] => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

export default function PhotoAdmin({ programs, mode }: { programs: ProgramInfo[]; mode: 'github' | 'local' | 'none' }) {
  const [slug, setSlug] = useState(programs[0]?.slug ?? '');
  const [layout, setLayout] = useState<PhotoLayout | null>(null);
  const [savedLayout, setSavedLayout] = useState<PhotoLayout | null>(null); // как сейчас на сайте / в хранилище
  const [uploads, setUploads] = useState<Record<string, Upload>>({}); // src → данные новой загрузки
  const [busy, setBusy] = useState<string>(''); // что сейчас грузится
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [picker, setPicker] = useState<null | ((src: string) => void)>(null);

  const program = programs.find((p) => p.slug === slug)!;
  const photos = layout?.[slug];
  const dirty = !!photos && JSON.stringify(photos) !== JSON.stringify(savedLayout?.[slug]);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/photos', { cache: 'no-store' }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok || !data?.ok) {
      setMessage({ ok: false, text: ERRORS[data?.error] ?? 'Не получилось загрузить данные.' });
      return;
    }
    setLayout(data.layout);
    setSavedLayout(data.layout);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (fn: (p: ProgramPhotos) => ProgramPhotos) => {
    setMessage(null);
    setLayout((l) => (l && l[slug] ? { ...l, [slug]: fn(l[slug]) } : l));
  };

  function switchProgram(next: string) {
    if (dirty && !confirm('Есть несохранённые изменения. Перейти без сохранения?')) return;
    if (dirty && savedLayout) setLayout((l) => l && { ...l, [slug]: savedLayout[slug] }); // отбросить правки
    setSlug(next);
    setMessage(null);
  }

  async function uploadFiles(files: FileList | File[]): Promise<string[]> {
    const done: string[] = [];
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const [i, f] of list.entries()) {
      setBusy(`Загружаю фото ${i + 1} из ${list.length}…`);
      try {
        const blob = await compress(f);
        const body = new FormData();
        body.append('slug', slug);
        body.append('file', blob, f.name);
        const res = await fetch('/api/admin/upload', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error);
        setUploads((u) => ({ ...u, [data.src]: { path: data.path, sha: data.sha, preview: URL.createObjectURL(blob) } }));
        done.push(data.src);
      } catch (e) {
        const code = e instanceof Error ? e.message : '';
        setMessage({ ok: false, text: `${f.name}: ${ERRORS[code] ?? 'не получилось загрузить.'}` });
      }
    }
    setBusy('');
    return done;
  }

  async function save() {
    if (!photos) return;
    setBusy('Сохраняю…');
    setMessage(null);
    const used = Object.entries(uploads).filter(([, u]) => u.path && u.sha).map(([, u]) => ({ path: u.path, sha: u.sha }));
    const res = await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, photos, uploads: used }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy('');
    if (!res?.ok || !data?.ok) {
      setMessage({ ok: false, text: ERRORS[data?.error] ?? 'Не сохранилось. Проверь интернет и попробуй ещё раз.' });
      return;
    }
    setSavedLayout((l) => l && { ...l, [slug]: photos });
    setMessage({
      ok: true,
      text: data.mode === 'github'
        ? `Сохранено. Сайт обновится сам через 1–2 минуты (коммит ${data.commit}).`
        : 'Сохранено в файлы проекта (локальный режим). Чтобы попало на сайт - закоммить и задеплой.',
    });
  }

  // Все фото программы — для «Выбрать из фото программы»
  const pool = useMemo(() => {
    if (!photos) return [];
    const set = new Set<string>();
    if (photos.cover) set.add(photos.cover.src);
    photos.gallery.forEach((g) => set.add(g.src));
    photos.days.forEach((d) => {
      if (d.image) set.add(d.image);
      d.images.forEach((s) => set.add(s));
    });
    Object.keys(uploads).filter((s) => s.startsWith(`/images/uploads/${slug}/`)).forEach((s) => set.add(s));
    return [...set];
  }, [photos, uploads, slug]);

  const thumb = (src: string) => uploads[src]?.preview ?? `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`;

  if (!layout || !photos) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-sm text-gray-600">
        {message ? <p className="text-[#C33529]">{message.text}</p> : <p className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" /> Загружаю…</p>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Фото программ</h1>
        <button type="button" onClick={async () => { await fetch('/api/admin/login', { method: 'DELETE' }); location.reload(); }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><LogOut size={15} /> Выйти</button>
      </div>

      {mode === 'local' && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Локальный режим: изменения пишутся в файлы проекта на этом компьютере, на сайт попадут после коммита и деплоя.
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {programs.map((p) => (
          <button key={p.slug} type="button" onClick={() => switchProgram(p.slug)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border ${p.slug === slug ? 'border-[#E03C31] bg-red-50 text-[#C33529]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {p.title}
          </button>
        ))}
      </div>

      {/* Обложка */}
      <Section title="Обложка" hint="Большое фото наверху страницы и на карточке в каталоге.">
        <div className="max-w-md">
          {photos.cover ? (
            <Tile src={thumb(photos.cover.src)} alt={photos.cover.alt} wide
              onAlt={(alt) => update((p) => ({ ...p, cover: p.cover && { ...p.cover, alt } }))}
              onRemove={() => update((p) => ({ ...p, cover: null }))} />
          ) : <Empty text="Обложки нет" />}
          <div className="mt-2 flex flex-wrap gap-2">
            <UploadButton label={photos.cover ? 'Заменить' : 'Загрузить'} disabled={!!busy}
              onFiles={async (f) => { const [src] = await uploadFiles([f[0]]); if (src) update((p) => ({ ...p, cover: { src, alt: p.cover?.alt ?? program.title } })); }} />
            <PickButton onClick={() => setPicker(() => (src: string) => update((p) => ({ ...p, cover: { src, alt: p.cover?.alt ?? program.title } })))} />
          </div>
        </div>
      </Section>

      {/* Галерея */}
      <Section title="Галерея" hint="Лента фото под обложкой. Порядок - стрелками.">
        <Grid>
          {photos.gallery.map((g, i) => (
            <Tile key={`${g.src}-${i}`} src={thumb(g.src)} alt={g.alt}
              onAlt={(alt) => update((p) => ({ ...p, gallery: p.gallery.map((x, j) => (j === i ? { ...x, alt } : x)) }))}
              onLeft={i > 0 ? () => update((p) => ({ ...p, gallery: move(p.gallery, i, -1) })) : undefined}
              onRight={i < photos.gallery.length - 1 ? () => update((p) => ({ ...p, gallery: move(p.gallery, i, 1) })) : undefined}
              onRemove={() => update((p) => ({ ...p, gallery: p.gallery.filter((_, j) => j !== i) }))} />
          ))}
        </Grid>
        <div className="mt-3 flex flex-wrap gap-2">
          <UploadButton label="Добавить фото" multiple disabled={!!busy}
            onFiles={async (f) => { const srcs = await uploadFiles(f); if (srcs.length) update((p) => ({ ...p, gallery: [...p.gallery, ...srcs.map((src) => ({ src, alt: program.title }))] })); }} />
          <PickButton onClick={() => setPicker(() => (src: string) => update((p) => ({ ...p, gallery: [...p.gallery, { src, alt: program.title }] })))} />
        </div>
      </Section>

      {/* По дням */}
      <Section title="План по дням" hint="Главное фото дня и дополнительные - они открываются в «Подробнее».">
        <div className="space-y-6">
          {program.days.map((day, di) => {
            const d = photos.days[di] ?? { image: null, images: [] };
            const setDay = (fn: (x: typeof d) => typeof d) =>
              update((p) => ({ ...p, days: p.days.map((x, j) => (j === di ? fn(x ?? { image: null, images: [] }) : x)) }));
            return (
              <div key={di} className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{day.label}</div>
                <div className="font-semibold text-gray-900 mb-3">{day.title}</div>
                <div className="text-xs font-medium text-gray-500 mb-1.5">Главное фото</div>
                <div className="max-w-xs">
                  {d.image ? <Tile src={thumb(d.image)} wide onRemove={() => setDay((x) => ({ ...x, image: null }))} /> : <Empty text="Без фото - текст дня на всю ширину" />}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <UploadButton label={d.image ? 'Заменить' : 'Загрузить'} disabled={!!busy}
                    onFiles={async (f) => { const [src] = await uploadFiles([f[0]]); if (src) setDay((x) => ({ ...x, image: src })); }} />
                  <PickButton onClick={() => setPicker(() => (src: string) => setDay((x) => ({ ...x, image: src })))} />
                </div>
                <div className="text-xs font-medium text-gray-500 mt-4 mb-1.5">Ещё фото дня</div>
                <Grid>
                  {d.images.map((src, i) => (
                    <Tile key={`${src}-${i}`} src={thumb(src)}
                      onLeft={i > 0 ? () => setDay((x) => ({ ...x, images: move(x.images, i, -1) })) : undefined}
                      onRight={i < d.images.length - 1 ? () => setDay((x) => ({ ...x, images: move(x.images, i, 1) })) : undefined}
                      onRemove={() => setDay((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))} />
                  ))}
                </Grid>
                <div className="mt-2 flex flex-wrap gap-2">
                  <UploadButton label="Добавить" multiple disabled={!!busy}
                    onFiles={async (f) => { const srcs = await uploadFiles(f); if (srcs.length) setDay((x) => ({ ...x, images: [...x.images, ...srcs] })); }} />
                  <PickButton onClick={() => setPicker(() => (src: string) => setDay((x) => ({ ...x, images: [...x.images, src] })))} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Нижняя панель */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0 text-sm">
            {busy ? <span className="inline-flex items-center gap-2 text-gray-600"><LoaderCircle size={15} className="animate-spin" /> {busy}</span>
              : message ? <span className={message.ok ? 'text-green-700' : 'text-[#C33529]'}>{message.text}</span>
              : dirty ? <span className="text-gray-600">Есть несохранённые изменения</span>
              : <span className="text-gray-400">Изменений нет</span>}
          </div>
          <button type="button" onClick={save} disabled={!dirty || !!busy}
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#E03C31] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#C33529] disabled:opacity-40">
            <Check size={16} /> Сохранить
          </button>
        </div>
      </div>

      {picker && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6" onClick={() => setPicker(null)}>
          <div className="w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Фото программы</h2>
              <button type="button" onClick={() => setPicker(null)} aria-label="Закрыть" className="p-1 text-gray-500"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {pool.map((src) => (
                <button key={src} type="button" onClick={() => { picker(src); setPicker(null); }}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:ring-2 ring-[#E03C31]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке */}
                  <img src={thumb(src)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mb-3">{hint}</p>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-3 text-center text-xs text-gray-400">{text}</div>;
}

function Tile({ src, alt, wide, onAlt, onLeft, onRight, onRemove }: {
  src: string; alt?: string; wide?: boolean; onAlt?: (alt: string) => void;
  onLeft?: () => void; onRight?: () => void; onRemove?: () => void;
}) {
  const btn = 'rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 disabled:opacity-30';
  return (
    <div>
      <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${wide ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке, в том числе ещё не опубликованных фото */}
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
          <div className="flex gap-1">
            {(onLeft || onRight) && <button type="button" className={btn} onClick={onLeft} disabled={!onLeft} aria-label="Левее"><ArrowLeft size={14} /></button>}
            {(onLeft || onRight) && <button type="button" className={btn} onClick={onRight} disabled={!onRight} aria-label="Правее"><ArrowRight size={14} /></button>}
          </div>
          {onRemove && <button type="button" className={btn} onClick={onRemove} aria-label="Убрать"><Trash2 size={14} /></button>}
        </div>
      </div>
      {onAlt && (
        <input value={alt ?? ''} onChange={(e) => onAlt(e.target.value)} placeholder="Подпись (для поиска и незрячих)"
          className="mt-1.5 w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-[#E03C31] focus:outline-none" maxLength={200} />
      )}
    </div>
  );
}

function UploadButton({ label, multiple, disabled, onFiles }: { label: string; multiple?: boolean; disabled?: boolean; onFiles: (f: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => input.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50">
        <ImagePlus size={15} /> {label}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden
        onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ''; if (f.length) onFiles(f); }} />
    </>
  );
}

function PickButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
      <Images size={15} /> Из фото программы
    </button>
  );
}
