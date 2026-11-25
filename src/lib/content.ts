// Проверка и нормализация данных, которые присылает админка (/admin): программы и организаторы.
// Всё, что не прошло проверку, отбрасывается или обрезается — в файлы сайта попадают только чистые данные.
// Тексты на сайте выводятся как обычный текст (без HTML), поэтому разметку внутри не исполнить.

import type { Organizer, Photo, PhotoCredit, Program } from '@/lib/programs';
import type { EquipmentSection, FAQ, HourlyItem, TourDay, TourFeature } from '@/lib/types';

const SHORT = 200;
const MEDIUM = 600;
const LONG = 6000;

// Путь к картинке сайта: только свои файлы (/images/… или файл в корне вроде /logo.jpg).
export function isSitePath(src: unknown): src is string {
  return (
    typeof src === 'string' &&
    /^\/(images\/[\w\-./]+|[\w\-]+)\.(jpe?g|png|webp|gif)$/i.test(src) &&
    !src.includes('..') &&
    !src.includes('//')
  );
}

function str(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function optStr(v: unknown, max: number): string | undefined {
  return str(v, max) || undefined;
}

function list<T>(v: unknown, max: number, item: (x: unknown) => T | null): T[] {
  return (Array.isArray(v) ? v : []).slice(0, max).map(item).filter((x): x is T => x !== null);
}

const strList = (v: unknown, max: number, len = MEDIUM) => list(v, max, (x) => str(x, len) || null);

function url(v: unknown): string | null {
  const s = str(v, 500);
  return /^https?:\/\/[^\s]+$/i.test(s) ? s : null;
}

function photo(v: unknown): Photo | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  return isSitePath(o.src) ? { src: o.src, alt: str(o.alt, SHORT) } : null;
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

function day(v: unknown, i: number): TourDay | null {
  const o = obj(v);
  const title = str(o.title, SHORT);
  if (!title) return null;
  const hourly = list<HourlyItem>(o.hourlySchedule, 40, (x) => {
    const h = obj(x);
    const activity = str(h.activity, SHORT);
    return activity ? { time: str(h.time, 20), activity } : null;
  });
  const images = list(o.images, 12, (x) => (isSitePath(x) ? x : null));
  return {
    dayNumber: Number.isFinite(Number(o.dayNumber)) ? Number(o.dayNumber) : i + 1,
    ...(optStr(o.badge, 6) ? { badge: str(o.badge, 6) } : {}),
    ...(optStr(o.label, 80) ? { label: str(o.label, 80) } : {}),
    title,
    shortDescription: str(o.shortDescription, MEDIUM),
    fullDescription: str(o.fullDescription, LONG),
    ...(hourly.length ? { hourlySchedule: hourly } : {}),
    ...(isSitePath(o.image) ? { image: o.image } : {}),
    ...(images.length ? { images } : {}),
  };
}

export type ProgramData = Omit<Program, 'conditionsMd' | 'operator'>;

// Программа из админки. slug, фото-подписи Wikimedia и юридические вкладки берутся из текущей версии —
// в админке они не меняются.
export function parseProgram(input: unknown, current: ProgramData, organizerIds: string[]): ProgramData | { error: string } {
  const o = obj(input);
  const title = str(o.title, SHORT);
  if (!title) return { error: 'Нужно название программы' };
  const price = Math.round(Number(o.price));
  if (!Number.isFinite(price) || price < 0 || price > 10_000_000) return { error: 'Цена - число в рублях' };

  const organizers = list(o.organizers, 6, (x) => {
    const g = obj(x);
    const id = str(g.id, 40);
    return organizerIds.includes(id) ? { id, role: str(g.role, SHORT) } : null;
  });
  if (organizers.length === 0) return { error: 'Нужен хотя бы один организатор' };

  const program = list(o.program, 30, (x) => x).map(day).filter((d): d is TourDay => !!d);

  const features = list<TourFeature>(o.features, 20, (x) => {
    const f = obj(x);
    const t = str(f.title, SHORT);
    return t ? { title: t, description: str(f.description, MEDIUM) } : null;
  });
  const faq = list<FAQ>(o.faq, 30, (x) => {
    const f = obj(x);
    const q = str(f.question, SHORT);
    return q ? { question: q, answer: str(f.answer, LONG) } : null;
  });
  const equipment = list<EquipmentSection>(o.equipment, 12, (x) => {
    const s = obj(x);
    const t = str(s.title, SHORT);
    if (!t) return null;
    const items = list(s.items, 40, (y) => {
      const it = obj(y);
      const name = str(it.name, SHORT);
      return name ? { name, required: it.required === true, ...(optStr(it.note, SHORT) ? { note: str(it.note, SHORT) } : {}) } : null;
    });
    return { title: t, items };
  });
  const notes = list(o.notes, 10, (x) => {
    const n = obj(x);
    const t = str(n.title, SHORT);
    if (!t) return null;
    const l = obj(n.link);
    const href = url(l.href);
    return { title: t, text: str(n.text, LONG), ...(href ? { link: { href, label: str(l.label, SHORT) || href } } : {}) };
  });
  const stats = list(o.stats, 6, (x) => {
    const s = obj(x);
    const value = str(s.value, 40);
    return value ? { label: str(s.label, 40), value } : null;
  });

  const gallery = list(o.gallery, 80, photo);
  const result: ProgramData = {
    slug: current.slug,
    title,
    kind: str(o.kind, 80),
    country: str(o.country, 80),
    region: str(o.region, 80),
    catalogGroup: str(o.catalogGroup, 80) || current.catalogGroup,
    ...(o.draft === true ? { draft: true } : {}),
    datesLabel: str(o.datesLabel, 120),
    datesShort: str(o.datesShort, 60),
    ...(strList(o.dateOptions, 30, 120).length ? { dateOptions: strList(o.dateOptions, 30, 120) } : {}),
    price,
    ...(optStr(o.priceNote, 120) ? { priceNote: str(o.priceNote, 120) } : {}),
    stats,
    ...(strList(o.tags, 20, 60).length ? { tags: strList(o.tags, 20, 60) } : {}),
    summary: strList(o.summary, 10, LONG),
    ...(features.length ? { features } : {}),
    included: strList(o.included, 30),
    notIncluded: strList(o.notIncluded, 30),
    ...(optStr(o.payment, MEDIUM) ? { payment: str(o.payment, MEDIUM) } : {}),
    ...(strList(o.bring, 40).length ? { bring: strList(o.bring, 40) } : {}),
    ...(equipment.length ? { equipment } : {}),
    ...(faq.length ? { faq } : {}),
    program,
    organizers,
    ...(optStr(o.groupSize, 120) ? { groupSize: str(o.groupSize, 120) } : {}),
    cover: photo(o.cover),
    gallery,
    photoCredits: current.photoCredits as PhotoCredit[],
    placeholders: strList(o.placeholders, 20, SHORT),
    ...(notes.length ? { notes } : {}),
  };
  return result;
}

export function parseOrganizers(input: unknown): Organizer[] | { error: string } {
  const seen = new Set<string>();
  const out: Organizer[] = [];
  for (const x of Array.isArray(input) ? input.slice(0, 50) : []) {
    const o = obj(x);
    const id = str(o.id, 40).toLowerCase();
    if (!/^[a-z0-9-]{2,40}$/.test(id)) return { error: `Код организатора «${id}»: только латиница, цифры и дефис` };
    if (seen.has(id)) return { error: `Код «${id}» повторяется` };
    seen.add(id);
    const org = str(o.org, SHORT);
    const person = str(o.person, SHORT);
    if (!org && !person) return { error: 'У организатора нужно название или имя' };
    out.push({
      id,
      org,
      person,
      photo: isSitePath(o.photo) ? o.photo : null,
      logo: isSitePath(o.logo) ? o.logo : null,
      link: url(o.link),
      contact: str(o.contact, 80),
      ...(optStr(o.about, 2000) ? { about: str(o.about, 2000) } : {}),
    });
  }
  if (out.length === 0) return { error: 'Нужен хотя бы один организатор' };
  return out;
}

// Все фото, которые сейчас стоят в программе (для подписей Wikimedia и выбора в админке).
export function usedPhotos(p: Pick<Program, 'cover' | 'gallery' | 'program'>): string[] {
  const set = new Set<string>();
  if (p.cover) set.add(p.cover.src);
  p.gallery.forEach((g) => set.add(g.src));
  p.program.forEach((d) => {
    if (d.image) set.add(d.image);
    d.images?.forEach((s) => set.add(s));
  });
  return [...set];
}
