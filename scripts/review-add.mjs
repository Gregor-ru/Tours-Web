#!/usr/bin/env node
// Добавление и удаление отзывов в ленту сайта (src/data/reviews.json + фото в public/images/reviews/<id>/).
// Инструкция — ops/2026-11-24_otzyvy-skript.md (в папке проекта Tour_work).
//
//   npm run review:add -- <ссылка ВК> [--program <slug>] [--photos 1,3]
//   npm run review:add -- <ссылка Авито / Яндекс Карт> --program <slug> --name "Имя" --date 2026-06-14 \
//        (--text "…" | --text-file отзыв.txt) [--photos 1.jpg 2.jpg 3.jpg] [--rating 5]
//   npm run review:add -- --source site --program <slug> --name "Имя" --date 2026-06-14 --text-file отзыв.txt [--photos …]
//   npm run review:remove -- <id>            удалить отзыв и его фото
//   npm run review:remove -- --tests         удалить все тестовые записи (--test)
//
// Общие флаги: --program <slug> (без него — общий отзыв, виден у всех программ), --test (тестовая запись),
// --force (перезаписать, если такой отзыв уже есть).
// ВК читается через VK API с сервисным ключом приложения из VK_SERVICE_TOKEN (.env.local, в репозиторий не класть).
// Авито и Яндекс Карты не парсим (правила площадок): текст, имя, дату и фото передаёшь сам.
// Имя на сайте — только имя или «Имя Ф.»: скрипт сокращает его сам и полное ФИО не сохраняет.
// Аватары не скачиваются. Фото из ВК — только выбранные: скрипт показывает список, по умолчанию не берёт ни одного.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/reviews.json');
const IMG_DIR = join(ROOT, 'public/images/reviews');
const VK_API = 'https://api.vk.com/method/';
const VK_VERSION = '5.199';
const MAX_PHOTOS = 3;
const MAX_BYTES = 300 * 1024;

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

try {
  process.loadEnvFile(join(ROOT, '.env.local'));
} catch {
  /* .env.local нет — берём переменные из окружения */
}

let parsed;
try {
  parsed = parseArgs({
  allowPositionals: true,
  options: {
    source: { type: 'string' },
    program: { type: 'string' },
    name: { type: 'string' },
    date: { type: 'string' },
    text: { type: 'string' },
    'text-file': { type: 'string' },
    photos: { type: 'string', multiple: true },
    rating: { type: 'string' },
    test: { type: 'boolean' },
    force: { type: 'boolean' },
    remove: { type: 'boolean' },
    tests: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});
} catch (e) {
  fail(`${e.message.split('.')[0]}. Список флагов: npm run review:add -- --help`);
}
const { values: opt, positionals } = parsed;
// --photos a.jpg b.jpg: всё, что после ссылки, тоже считаем фото.
// --photos 1,3 (только номера) — какие фото взять из отзыва ВК.
const photoArgs = [...(opt.photos ?? []), ...positionals.slice(opt.source === 'site' ? 0 : 1)];
const photoPicks = photoArgs.length > 0 && photoArgs.every((a) => /^[\d,\s]+$/.test(a))
  ? [...new Set(photoArgs.join(',').split(/[,\s]+/).filter(Boolean).map(Number))]
  : null;

if (opt.help) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 17).join('\n'));
  process.exit(0);
}

const load = () => JSON.parse(readFileSync(DATA, 'utf8'));
const save = (list) => writeFileSync(DATA, JSON.stringify(list, null, 2) + '\n');

// ---------- удаление ----------
if (opt.remove) {
  const list = load();
  const ids = opt.tests ? list.filter((r) => r.test).map((r) => r.id) : positionals;
  if (ids.length === 0) fail(opt.tests ? 'Тестовых записей нет.' : 'Укажи id отзыва: npm run review:remove -- <id>');
  for (const id of ids) {
    if (!list.some((r) => r.id === id)) fail(`Отзыва с id ${id} нет.`);
    rmSync(join(IMG_DIR, id), { recursive: true, force: true });
  }
  save(list.filter((r) => !ids.includes(r.id)));
  console.log(`✓ Удалено: ${ids.join(', ')}`);
  process.exit(0);
}

// ---------- общее ----------
function programSlugs() {
  return JSON.parse(readFileSync(join(ROOT, 'src/data/content/programs.json'), 'utf8')).map((p) => p.slug);
}

function detectSource(url) {
  let host;
  try {
    host = new URL(url).hostname.replace(/^(www|m)\./, '');
  } catch {
    fail(`Не похоже на ссылку: ${url}`);
  }
  if (host === 'vk.com' || host === 'vk.ru') return 'vk';
  if (host.endsWith('avito.ru')) return 'avito';
  if (/^yandex\.(ru|com|by|kz)$/.test(host) || host === 'maps.yandex.ru') return 'yandex';
  fail(`Не знаю, что это за площадка: ${host}. Поддерживаются ВК, Авито, Яндекс Карты.`);
}

let sharp;
async function getSharp() {
  if (!sharp) {
    try {
      sharp = (await import('sharp')).default;
    } catch {
      fail('Нет модуля sharp (обычно ставится вместе с Next.js). Выполни npm ci в папке сайта.');
    }
  }
  return sharp;
}

// Сохраняет картинку в WebP: до maxSide px по большей стороне, до 300 КБ.
async function saveWebp(input, outPath, maxSide = 1600) {
  const s = await getSharp();
  for (const [side, q] of [[maxSide, 80], [maxSide, 72], [Math.round(maxSide * 0.85), 68], [Math.round(maxSide * 0.7), 62]]) {
    const buf = await s(input).rotate().resize(side, side, { fit: 'inside', withoutEnlargement: true }).webp({ quality: q }).toBuffer();
    if (buf.length <= MAX_BYTES || q === 62) {
      writeFileSync(outPath, buf);
      return;
    }
  }
}

async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) fail(`Не скачалось фото (HTTP ${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function readLocal(path) {
  const p = resolve(process.cwd(), path);
  if (!existsSync(p)) fail(`Нет файла: ${path}`);
  return readFileSync(p);
}

// «Анна Иванова» → «Анна И.»; «Анна» → «Анна». Отчество отбрасываем:
// «Анна Сергеевна Иванова» и «Иванова Анна Сергеевна» → «Анна И.».
const PATRONYMIC = /(вич|вна|ична|чна)$/i;
function shortName(full) {
  const words = String(full).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  let [first, last] = words;
  if (words.length >= 3) {
    if (PATRONYMIC.test(words[2])) [last, first] = words; // Фамилия Имя Отчество
    else if (PATRONYMIC.test(words[1])) [first, , last] = words; // Имя Отчество Фамилия
  } else if (words.length === 2 && PATRONYMIC.test(words[1])) {
    last = undefined; // Имя Отчество
  }
  last = last?.replace(/[^\p{L}]/gu, '');
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

const isoDate = (unix) => new Date(unix * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' });

// ---------- ВКонтакте ----------
async function vk(method, params) {
  const token = process.env.VK_SERVICE_TOKEN?.trim();
  if (!token) fail('Нет VK_SERVICE_TOKEN. Добавь сервисный ключ приложения ВК в .env.local (инструкция: ops/2026-11-24_vk-servisnyj-klyuch.md).');
  const body = new URLSearchParams({ ...params, access_token: token, v: VK_VERSION, lang: 'ru' });
  const res = await fetch(VK_API + method, { method: 'POST', body, signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  if (data.error) {
    const e = new Error(`VK API ${method}: ошибка ${data.error.error_code} - ${data.error.error_msg}`);
    e.code = data.error.error_code;
    throw e;
  }
  return data.response;
}

function vkExplain(err) {
  // 15 — нет доступа (закрытая стена/группа), 18 — удалено, 28/27 — метод недоступен с этим типом ключа
  if ([27, 28].includes(err.code))
    return `${err.message}\nЭтот метод VK API не работает с сервисным ключом. Для такой ссылки нужен ключ пользователя - напиши в чат «Операционка».`;
  if (err.code === 15 || err.code === 30)
    return `${err.message}\nСтена или обсуждение закрыты для посторонних - сервисный ключ видит только открытые сообщества.`;
  if (err.code === 5) return `${err.message}\nКлюч неверный или отозван - проверь VK_SERVICE_TOKEN.`;
  return err.message;
}

// Разбор ссылок: пост, комментарий к посту, сообщение в обсуждении
function parseVkUrl(raw) {
  const u = new URL(raw);
  const w = u.searchParams.get('w'); // vk.com/club1?w=wall-1_2_r3
  const path = w ? `/${w}` : u.pathname;
  let m = path.match(/^\/wall(-?\d+)_(\d+)(?:_r(\d+))?/);
  if (m) {
    const reply = m[3] ?? u.searchParams.get('reply');
    return reply
      ? { kind: 'comment', owner: m[1], post: m[2], comment: reply }
      : { kind: 'post', owner: m[1], post: m[2] };
  }
  m = path.match(/^\/topic-(\d+)_(\d+)/);
  if (m) {
    const post = u.searchParams.get('post');
    if (!post) fail('В ссылке на обсуждение нет конкретного сообщения (?post=…). Открой сообщение в обсуждении и скопируй ссылку на него.');
    return { kind: 'board', group: m[1], topic: m[2], comment: post };
  }
  fail(
    'Такую ссылку ВК скрипт не понимает. Поддерживаются: пост (vk.com/wall-1_2), комментарий (vk.com/wall-1_2?reply=3) ' +
      'и сообщение в обсуждении (vk.com/topic-1_2?post=3). Раздел «Отзывы» сообщества через API, насколько мне известно, не читается - ' +
      'такой отзыв добавь вручную: --source vk --name … --date … --text-file … и ссылкой на отзыв.',
  );
}

function vkAuthor(fromId, profiles = [], groups = []) {
  if (fromId > 0) {
    const p = profiles.find((x) => x.id === fromId);
    return p ? { name: shortName(`${p.first_name} ${p.last_name}`) } : null;
  }
  const g = groups.find((x) => x.id === -fromId);
  return g ? { name: g.name } : null; // автор — сообщество: название как есть
}

const vkText = (t = '') => t.replace(/\[(?:id|club|public)\d+\|([^\]]+)\]/g, '$1').trim();

function vkPhotoUrls(attachments = []) {
  return attachments
    .filter((a) => a.type === 'photo' && a.photo)
    .map((a) => a.photo.orig_photo?.url ?? [...(a.photo.sizes ?? [])].sort((x, y) => x.width * x.height - y.width * y.height).pop()?.url)
    .filter(Boolean);
}

async function fromVk(url) {
  const ref = parseVkUrl(url);
  const fields = 'first_name,last_name';
  let item, profiles, groups, id;
  try {
    if (ref.kind === 'post') {
      const r = await vk('wall.getById', { posts: `${ref.owner}_${ref.post}`, extended: 1, fields });
      item = (r.items ?? r)[0];
      ({ profiles, groups } = r);
      id = `vk-wall${ref.owner}_${ref.post}`;
    } else if (ref.kind === 'comment') {
      try {
        const r = await vk('wall.getComment', { owner_id: ref.owner, comment_id: ref.comment, extended: 1, fields });
        item = r.items?.[0];
        ({ profiles, groups } = r);
      } catch (e) {
        if (![27, 28].includes(e.code)) throw e;
        const r = await vk('wall.getComments', {
          owner_id: ref.owner, post_id: ref.post, start_comment_id: ref.comment, count: 1, extended: 1, fields,
        });
        item = r.items?.find((c) => String(c.id) === String(ref.comment));
        ({ profiles, groups } = r);
      }
      id = `vk-wall${ref.owner}_${ref.post}-${ref.comment}`;
    } else {
      const r = await vk('board.getComments', {
        group_id: ref.group, topic_id: ref.topic, start_comment_id: ref.comment, count: 1, extended: 1,
      });
      item = r.items?.find((c) => String(c.id) === String(ref.comment));
      ({ profiles, groups } = r);
      id = `vk-topic-${ref.group}_${ref.topic}-${ref.comment}`;
    }
  } catch (e) {
    fail(vkExplain(e));
  }
  if (!item) fail('ВК не вернул такую запись: она удалена, скрыта или ссылка неточная.');
  const author = vkAuthor(item.from_id ?? item.owner_id, profiles, groups);
  return {
    id,
    name: author?.name ?? fail('Не нашёл имя автора - добавь отзыв вручную с --name'),
    date: opt.date ?? isoDate(item.date),
    text: readText() ?? vkText(item.text),
    photoSrcs: await pickVkPhotos(id, vkPhotoUrls(item.attachments)),
  };
}

// Фото из отзыва ВК: скачиваем во временную папку, показываем список, берём только выбранные.
// --photos 1,3 — выбор заранее; без него — вопрос в терминале; не в терминале — ни одного.
async function pickVkPhotos(id, urls) {
  if (urls.length === 0) {
    if (photoPicks?.length) console.warn('! В отзыве нет фото - номера из --photos пропускаю.');
    return [];
  }
  const tmp = join(tmpdir(), 'gregor-review-photos', id);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const files = [];
  for (const [i, u] of urls.slice(0, 10).entries()) {
    const f = join(tmp, `${i + 1}.jpg`);
    writeFileSync(f, await download(u));
    files.push(f);
  }
  console.log(`\nВ отзыве ${files.length} фото (временно скачаны, открой и посмотри):`);
  files.forEach((f, i) => console.log(`  ${i + 1}: ${f}`));
  console.log('Фото, где узнаются люди, - только с согласия автора (ГК РФ ст. 152.1).');

  let picks = photoPicks;
  if (!picks && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`Какие взять? Номера через запятую, до ${MAX_PHOTOS} (Enter - ни одного): `);
    rl.close();
    picks = answer.split(/[,\s]+/).filter(Boolean).map(Number);
  }
  picks = picks ?? [];
  const bad = picks.filter((n) => !Number.isInteger(n) || n < 1 || n > files.length);
  if (bad.length) fail(`Нет фото с номером ${bad.join(', ')}. Есть 1–${files.length}.`);
  if (picks.length > MAX_PHOTOS) fail(`Можно взять не больше ${MAX_PHOTOS} фото.`);
  const chosen = picks.map((n) => readFileSync(files[n - 1]));
  rmSync(tmp, { recursive: true, force: true }); // невыбранные не сохраняем
  return chosen.map((buf) => () => buf);
}

function readText() {
  if (opt['text-file']) return readLocal(opt['text-file']).toString('utf8').trim();
  return opt.text?.trim() ?? null;
}

// ---------- основной сценарий ----------
const url = opt.source === 'site' ? null : positionals[0];
const source = opt.source ?? (url ? detectSource(url) : fail('Нужна ссылка на отзыв или --source site.'));
if (!['site', 'vk', 'avito', 'yandex'].includes(source)) fail(`Неизвестный источник: ${source}`);
if (source !== 'site' && !url) fail('Для отзыва из ВК, Авито или Яндекс Карт нужна ссылка на оригинал.');

if (opt.program && !programSlugs().includes(opt.program)) fail(`Нет программы ${opt.program}. Есть: ${programSlugs().join(', ')}`);
if (opt.date && !/^\d{4}-\d{2}-\d{2}$/.test(opt.date)) fail('Дата - в формате ГГГГ-ММ-ДД, например 2026-06-14.');
const rating = opt.rating ? Number(opt.rating) : undefined;
if (rating !== undefined && ![1, 2, 3, 4, 5].includes(rating)) fail('Оценка --rating - число от 1 до 5.');

let entry;
if (source === 'vk' && !opt.name) {
  entry = await fromVk(url); // текст, имя, дата и фото — из VK API
} else {
  const text = readText();
  if (!opt.name) fail('Укажи имя автора: --name "Анна" или --name "Анна К."');
  if (photoPicks) fail('Для этого источника --photos - это пути к файлам (например --photos 1.jpg 2.jpg), а не номера.');
  if (!opt.date) fail('Укажи дату отзыва: --date ГГГГ-ММ-ДД');
  if (!text) fail('Укажи текст: --text "…" или --text-file отзыв.txt');
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  entry = {
    id: url ? `${source}-${createHash('sha1').update(url).digest('hex').slice(0, 10)}` : `site-${stamp}`,
    name: shortName(opt.name),
    date: opt.date,
    text,
    photoSrcs: photoArgs.map((p) => () => readLocal(p)),
  };
}

if (entry.text.length < 2) fail('У отзыва пустой текст.');
const list = load();
const dup = list.find((r) => r.id === entry.id || (url && r.url === url));
if (dup && !opt.force) fail(`Этот отзыв уже есть (id ${dup.id}). Чтобы перезаписать - добавь --force.`);
if (entry.photoSrcs.length > MAX_PHOTOS) console.warn(`! Фото больше ${MAX_PHOTOS} - беру первые ${MAX_PHOTOS}.`);

const dir = join(IMG_DIR, entry.id);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const photos = [];
for (const [i, src] of entry.photoSrcs.slice(0, MAX_PHOTOS).entries()) {
  await saveWebp(await src(), join(dir, `${i + 1}.webp`));
  photos.push(`/images/reviews/${entry.id}/${i + 1}.webp`);
}
if (!photos.length) rmSync(dir, { recursive: true, force: true });

const review = {
  id: entry.id,
  source,
  ...(url ? { url } : {}),
  ...(opt.program ? { program: opt.program } : {}),
  name: entry.name,
  date: entry.date,
  text: entry.text,
  ...(photos.length ? { photos } : {}),
  ...(rating ? { rating } : {}),
  ...(opt.test ? { test: true } : {}),
};
save([...list.filter((r) => r.id !== review.id && !(url && r.url === url)), review]);

console.log(`\n✓ Добавлен отзыв ${review.id} (${source}${opt.program ? `, ${opt.program}` : ', общий'})`);
console.log(`  ${review.name}, ${review.date}, фото: ${photos.length}`);
console.log(`  ${review.text.slice(0, 120)}${review.text.length > 120 ? '…' : ''}`);
console.log('\nПроверь на сайте (npm run dev), потом закоммить src/data/reviews.json и public/images/reviews/.\n');
