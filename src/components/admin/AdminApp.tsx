'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ExternalLink, LoaderCircle, LogOut, X } from 'lucide-react';
import type { Organizer } from '@/lib/programs';
import type { ProgramData } from '@/lib/content';
import ProgramEditor from './ProgramEditor';
import OrganizersEditor from './OrganizersEditor';

// Админка сайта: тексты, блоки, план по дням и фото программ + организаторы.
// Новые фото сжимаются в браузере (до 2000 px, WebP/JPEG) и попадают на сайт после «Сохранить».

type Upload = { path?: string; sha?: string; preview: string };
type Tab = { kind: 'program'; slug: string } | { kind: 'organizers' };

export interface Media {
  thumb: (src: string) => string;
  upload: (folder: string, files: File[]) => Promise<string[]>;
  pick: (pool: string[], onPick: (src: string) => void) => void;
  busy: boolean;
}

const ERRORS: Record<string, string> = {
  unauthorized: 'Сессия закончилась - обнови страницу и войди снова.',
  not_configured: 'Хранилище не настроено (нет GITHUB_TOKEN / GITHUB_REPO).',
  too_large: 'Фото слишком большое даже после сжатия.',
  not_image: 'Это не фото (нужен JPG, PNG или WebP).',
  storage_failed: 'GitHub не ответил или отказал. Попробуй ещё раз; если повторится - проверь токен.',
  bad_request: 'Сервер не принял данные.',
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

export default function AdminApp({ mode }: { mode: 'github' | 'local' | 'none' }) {
  const [programs, setPrograms] = useState<ProgramData[] | null>(null);
  const [organizers, setOrganizers] = useState<Organizer[] | null>(null);
  const [saved, setSaved] = useState<{ programs: ProgramData[]; organizers: Organizer[] } | null>(null);
  const [tab, setTab] = useState<Tab | null>(null);
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [picker, setPicker] = useState<{ pool: string[]; onPick: (src: string) => void } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/content', { cache: 'no-store' }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok || !data?.ok) {
      setMessage({ ok: false, text: ERRORS[data?.error] ?? 'Не получилось загрузить данные.' });
      return;
    }
    setPrograms(data.programs);
    setOrganizers(data.organizers);
    setSaved({ programs: data.programs, organizers: data.organizers });
    setTab((t) => t ?? { kind: 'program', slug: data.programs[0]?.slug });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = tab?.kind === 'program' ? programs?.find((p) => p.slug === tab.slug) : undefined;
  const dirty = useMemo(() => {
    if (!saved || !tab) return false;
    if (tab.kind === 'organizers') return JSON.stringify(organizers) !== JSON.stringify(saved.organizers);
    return JSON.stringify(current) !== JSON.stringify(saved.programs.find((p) => p.slug === tab.slug));
  }, [saved, tab, organizers, current]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function switchTab(next: Tab) {
    if (dirty) {
      if (!confirm('Есть несохранённые изменения. Перейти без сохранения?')) return;
      // отбросить правки текущей вкладки
      if (saved) {
        if (tab?.kind === 'organizers') setOrganizers(saved.organizers);
        else if (tab) setPrograms((ps) => ps && ps.map((p) => (p.slug === tab.slug ? saved.programs.find((s) => s.slug === p.slug) ?? p : p)));
      }
    }
    setTab(next);
    setMessage(null);
    window.scrollTo({ top: 0 });
  }

  const media: Media = {
    busy: !!busy,
    thumb: (src) => uploads[src]?.preview ?? `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`,
    pick: (pool, onPick) => setPicker({ pool, onPick }),
    upload: async (folder, files) => {
      const done: string[] = [];
      const list = files.filter((f) => f.type.startsWith('image/'));
      for (const [i, f] of list.entries()) {
        setBusy(`Загружаю фото ${i + 1} из ${list.length}…`);
        try {
          const blob = await compress(f);
          const body = new FormData();
          body.append('slug', folder);
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
    },
  };

  async function save() {
    if (!tab || !saved) return;
    setBusy('Сохраняю…');
    setMessage(null);
    const ups = Object.values(uploads).filter((u) => u.path && u.sha).map((u) => ({ path: u.path, sha: u.sha }));
    const body = tab.kind === 'organizers'
      ? { kind: 'organizers', data: organizers, uploads: ups }
      : { kind: 'program', slug: tab.slug, data: current, uploads: ups };
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy('');
    if (!res?.ok || !data?.ok) {
      setMessage({ ok: false, text: data?.message ?? ERRORS[data?.error] ?? 'Не сохранилось. Проверь интернет и попробуй ещё раз.' });
      return;
    }
    // Перечитываем то, что реально сохранилось (сервер чистит пустые пункты и лишние пробелы)
    await load();
    setMessage({
      ok: true,
      text: data.mode === 'github'
        ? `Сохранено. Сайт обновится сам через 1–2 минуты (коммит ${data.commit}).`
        : 'Сохранено в файлы проекта (локальный режим). Чтобы попало на сайт - закоммить и задеплой.',
    });
  }

  if (!programs || !organizers || !tab) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-sm text-gray-600">
        {message ? <p className="text-[#C33529]">{message.text}</p> : <p className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" /> Загружаю…</p>}
      </div>
    );
  }

  const chip = (on: boolean) =>
    `flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border ${on ? 'border-[#E03C31] bg-red-50 text-[#C33529]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Редактор сайта</h1>
        <button type="button" onClick={async () => { await fetch('/api/admin/login', { method: 'DELETE' }); location.reload(); }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><LogOut size={15} /> Выйти</button>
      </div>

      {mode === 'local' && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Локальный режим: изменения пишутся в файлы проекта на этом компьютере, на сайт попадут после коммита и деплоя.
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
        {programs.map((p) => (
          <button key={p.slug} type="button" onClick={() => switchTab({ kind: 'program', slug: p.slug })}
            className={chip(tab.kind === 'program' && tab.slug === p.slug)}>{p.title}</button>
        ))}
        <button type="button" onClick={() => switchTab({ kind: 'organizers' })} className={chip(tab.kind === 'organizers')}>Организаторы</button>
      </div>
      {current && (
        <a href={`/tours/${current.slug}`} target="_blank" rel="noopener noreferrer"
          className="mb-5 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
          Открыть страницу на сайте <ExternalLink size={12} />
        </a>
      )}

      <div className="mt-3">
        {current && (
          <ProgramEditor key={current.slug} program={current} organizers={organizers} media={media}
            onChange={(next) => { setMessage(null); setPrograms((ps) => ps && ps.map((p) => (p.slug === next.slug ? next : p))); }} />
        )}
        {tab.kind === 'organizers' && (
          <OrganizersEditor organizers={organizers} savedIds={saved?.organizers.map((o) => o.id) ?? []} media={media} onChange={(next) => { setMessage(null); setOrganizers(next); }} />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
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
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 sm:p-6" onClick={() => setPicker(null)}>
          <div className="w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Выбрать фото</h2>
              <button type="button" onClick={() => setPicker(null)} aria-label="Закрыть" className="p-1 text-gray-500"><X size={20} /></button>
            </div>
            {picker.pool.length === 0 && <p className="text-sm text-gray-500">Фото пока нет - загрузи новое.</p>}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {picker.pool.map((src) => (
                <button key={src} type="button" onClick={() => { picker.onPick(src); setPicker(null); }}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:ring-2 ring-[#E03C31]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке */}
                  <img src={media.thumb(src)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
