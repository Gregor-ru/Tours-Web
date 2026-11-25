'use client';

import { useRef } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ImagePlus, Images, Plus, Trash2 } from 'lucide-react';

// Общие поля админки: текст, списки, фото.

export const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E03C31] focus:outline-none focus:ring-2 focus:ring-[#E03C31]/20';
const smallBtn = 'inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40';
const iconBtn = 'rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30';

export function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export function Block({ title, hint, children, open }: { title: string; hint?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-xl border border-gray-200 bg-white mb-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
        </div>
        <ChevronDown size={18} className="flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-gray-100 px-4 py-4 space-y-4">{children}</div>
    </details>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

export function Text({ label, hint, value, onChange, placeholder, max = 200 }: {
  label: string; hint?: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string; max?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={max} />
    </Field>
  );
}

export function Area({ label, hint, value, onChange, rows = 4, max = 6000 }: {
  label: string; hint?: string; value: string | undefined; onChange: (v: string) => void; rows?: number; max?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={inputCls} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} maxLength={max} />
    </Field>
  );
}

function RowControls({ i, n, onMove, onRemove, vertical = true }: {
  i: number; n: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; vertical?: boolean;
}) {
  return (
    <div className="flex flex-shrink-0 items-start gap-0.5">
      <button type="button" className={iconBtn} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Выше">{vertical ? <ArrowUp size={15} /> : <ArrowLeft size={15} />}</button>
      <button type="button" className={iconBtn} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Ниже">{vertical ? <ArrowDown size={15} /> : <ArrowRight size={15} />}</button>
      <button type="button" className={iconBtn} onClick={onRemove} aria-label="Удалить"><Trash2 size={15} /></button>
    </div>
  );
}

// Список строк: пункты «Включено», абзацы описания, теги…
export function StringList({ label, hint, items, onChange, multiline, addLabel = 'Добавить', placeholder }: {
  label: string; hint?: string; items: string[] | undefined; onChange: (v: string[]) => void;
  multiline?: boolean; addLabel?: string; placeholder?: string;
}) {
  const list = items ?? [];
  return (
    <div>
      <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
      {hint && <div className="text-xs text-gray-400 mb-2">{hint}</div>}
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea className={inputCls} rows={3} value={item} placeholder={placeholder}
                onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <input className={inputCls} value={item} placeholder={placeholder}
                onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <RowControls i={i} n={list.length} onMove={(d) => onChange(move(list, i, d))} onRemove={() => onChange(list.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <button type="button" className={`${smallBtn} mt-2`} onClick={() => onChange([...list, ''])}><Plus size={14} /> {addLabel}</button>
    </div>
  );
}

// Список карточек с несколькими полями: «Что тебя ждёт», вопросы, расписание…
export function ItemList<T>({ label, hint, items, onChange, empty, render, addLabel = 'Добавить', itemTitle }: {
  label?: string; hint?: string; items: T[] | undefined; onChange: (v: T[]) => void; empty: () => T;
  render: (item: T, set: (patch: Partial<T>) => void, i: number) => React.ReactNode;
  addLabel?: string; itemTitle?: (item: T, i: number) => string;
}) {
  const list = items ?? [];
  return (
    <div>
      {label && <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>}
      {hint && <div className="text-xs text-gray-400 mb-2">{hint}</div>}
      <div className="space-y-3">
        {list.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-xs font-semibold text-gray-500">{itemTitle ? itemTitle(item, i) : `${i + 1}`}</div>
              <RowControls i={i} n={list.length} onMove={(d) => onChange(move(list, i, d))} onRemove={() => {
                if (confirm('Удалить этот пункт?')) onChange(list.filter((_, j) => j !== i));
              }} />
            </div>
            <div className="space-y-3">{render(item, (patch) => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>
          </div>
        ))}
      </div>
      <button type="button" className={`${smallBtn} mt-2`} onClick={() => onChange([...list, empty()])}><Plus size={14} /> {addLabel}</button>
    </div>
  );
}

// ---------- фото ----------

export function Empty({ text, round }: { text: string; round?: boolean }) {
  return (
    <div className={`flex items-center justify-center border-2 border-dashed border-gray-200 px-3 text-center text-xs text-gray-400 ${round ? 'h-24 w-24 rounded-full' : 'aspect-[4/3] rounded-xl'}`}>{text}</div>
  );
}

export function Tile({ src, alt, wide, round, onAlt, onLeft, onRight, onRemove }: {
  src: string; alt?: string; wide?: boolean; round?: boolean; onAlt?: (alt: string) => void;
  onLeft?: () => void; onRight?: () => void; onRemove?: () => void;
}) {
  const btn = 'rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 disabled:opacity-30';
  return (
    <div>
      <div className={`relative overflow-hidden bg-gray-100 ${round ? 'h-24 w-24 rounded-full' : `rounded-xl ${wide ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке, в том числе ещё не опубликованных фото */}
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" loading="lazy" />
        <div className={`absolute inset-x-0 top-0 flex p-1.5 ${round ? 'justify-end' : 'justify-between'}`}>
          {!round && (
            <div className="flex gap-1">
              {(onLeft || onRight) && <button type="button" className={btn} onClick={onLeft} disabled={!onLeft} aria-label="Левее"><ArrowLeft size={14} /></button>}
              {(onLeft || onRight) && <button type="button" className={btn} onClick={onRight} disabled={!onRight} aria-label="Правее"><ArrowRight size={14} /></button>}
            </div>
          )}
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

export function UploadButton({ label, multiple, disabled, onFiles }: { label: string; multiple?: boolean; disabled?: boolean; onFiles: (f: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => input.current?.click()} className={smallBtn}>
        <ImagePlus size={14} /> {label}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden
        onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ''; if (f.length) onFiles(f); }} />
    </>
  );
}

export function PickButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={smallBtn}>
      <Images size={14} /> Из фото программы
    </button>
  );
}

export function PhotoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{children}</div>;
}
