// POST /api/lead — приём заявки с формы тура.
// Заявка НЕ сохраняется на сервере сайта: проверяется и сразу уходит в Telegram.
// В логи не пишем ни одного поля заявки (ПДн).
import { parseLead, validateLead } from '@/lib/lead';
import { formatLeadMessage, getTelegramConfig, sendToAll } from '@/lib/telegram';
import { getProgram } from '@/data/programs';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

const MIN_FILL_MS = 2000; // быстрее — почти наверняка бот
const MAX_BODY_BYTES = 10_000;

// Не больше 3 заявок с одного IP за 10 минут (src/lib/rate-limit.ts).
const rateLimited = createRateLimiter(3, 10 * 60 * 1000);

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const now = Date.now();

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return json(415, { ok: false, error: 'bad_request' });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'bad_request' });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  const lead = parseLead(body);

  // Honeypot или слишком быстрая отправка (время считает браузер, не зависит от часов): отвечаем «успехом»,
  // чтобы бот не подбирал обход, но никуда не отправляем.
  if (lead.website || lead.fillMs < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  if (rateLimited(clientIp(request), now)) {
    return json(429, { ok: false, error: 'rate_limited' });
  }

  const program = getProgram(lead.tour);
  if (!program) return json(400, { ok: false, error: 'bad_request' });

  const errors = validateLead(lead, program.dateOptions);
  if (Object.keys(errors).length > 0) {
    return json(422, { ok: false, error: 'validation', fields: errors });
  }

  if (!getTelegramConfig().ok) {
    console.error('[lead] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_IDS не заданы');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const text = formatLeadMessage(lead, new Date(now));
  const { delivered, total } = await sendToAll(text);

  if (delivered === 0) {
    console.error(`[lead] не доставлено ни одному получателю (0/${total})`);
    return json(502, { ok: false, error: 'delivery_failed' });
  }
  if (delivered < total) {
    console.error(`[lead] доставлено частично: ${delivered}/${total}`);
  }

  return json(200, { ok: true });
}
