// POST /api/review — отзыв из формы «Оставить отзыв».
// На сайт сразу не публикуется и на сервере не хранится: текст и фото уходят в Telegram
// владельцу на модерацию, публикация — скриптом review:add. В логи поля отзыва не пишем.
// Защиты те же, что у заявки: honeypot, время заполнения, лимит частоты с одного IP.
import { PROGRAMS, getProgram } from '@/data/programs';
import { clean } from '@/lib/lead';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';
import { REVIEW_LIMITS, validateReview } from '@/lib/review-form';
import { getTelegramConfig, sendPhotosToAll, sendToAll } from '@/lib/telegram';

const MIN_FILL_MS = 4000; // отзыв пишут дольше заявки
const rateLimited = createRateLimiter(3, 30 * 60 * 1000);

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const now = Date.now();

  if (!(request.headers.get('content-type') ?? '').includes('multipart/form-data')) {
    return json(415, { ok: false, error: 'bad_request' });
  }
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > REVIEW_LIMITS.totalBytes) return json(413, { ok: false, error: 'too_large' });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  const website = clean(form.get('website'), 200);
  const fillMs = Number(form.get('fillMs')) || 0;
  if (website || fillMs < MIN_FILL_MS) return json(200, { ok: true }); // бот: делаем вид, что всё хорошо

  if (rateLimited(clientIp(request), now)) return json(429, { ok: false, error: 'rate_limited' });

  const fields = {
    program: clean(form.get('program'), 40),
    name: clean(form.get('name'), REVIEW_LIMITS.name),
    text: clean(form.get('text'), REVIEW_LIMITS.text),
  };
  const photos = form.getAll('photos').filter((p): p is File => p instanceof File && p.size > 0);
  const total = photos.reduce((s, p) => s + p.size, 0);

  const errors = validateReview(fields, PROGRAMS.map((p) => p.slug), photos);
  if (total > REVIEW_LIMITS.totalBytes) errors.photos = 'Фото слишком большие, попробуй меньше';
  if (Object.keys(errors).length > 0) return json(422, { ok: false, error: 'validation', fields: errors });

  if (!getTelegramConfig().ok) {
    console.error('[review] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_IDS не заданы');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const program = getProgram(fields.program)!;
  const when = new Date(now).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const text = [
    `Новый отзыв с сайта (на модерации): ${program.title}`,
    '',
    `Имя: ${fields.name}`,
    '',
    fields.text,
    '',
    `Фото: ${photos.length ? `${photos.length} шт. - следующим сообщением` : 'нет'}`,
    `Получен: ${when} (МСК)`,
    '',
    'Опубликовать: сохрани текст в файл (и фото, если есть) и выполни',
    `npm run review:add -- --source site --program ${program.slug} --name "${fields.name.replace(/"/g, "'")}" --text-file отзыв.txt${photos.length ? ' --photos фото1.jpg …' : ''}`,
  ].join('\n');

  const sent = await sendToAll(text.slice(0, 4000));
  if (sent.delivered === 0) {
    console.error(`[review] текст не доставлен ни одному получателю (0/${sent.total})`);
    return json(502, { ok: false, error: 'delivery_failed' });
  }

  if (photos.length > 0) {
    const album = await sendPhotosToAll(
      photos.map((p, i) => ({ data: p, name: `review-${i + 1}.${p.type.split('/')[1] ?? 'jpg'}` })),
      `Фото к отзыву: ${fields.name}, ${program.title}`,
    );
    if (album.delivered < album.total) console.error(`[review] фото доставлены частично: ${album.delivered}/${album.total}`);
  }

  return json(200, { ok: true });
}
