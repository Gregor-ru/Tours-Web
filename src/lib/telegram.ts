// Отправка уведомления о заявке в Telegram через Bot API.
// Только на сервере: токен и chat_id — из переменных окружения, в репозитории их нет.
import 'server-only';

import { getProgram } from '@/data/programs';

export function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? '';
  const chatIds = (process.env.TELEGRAM_CHAT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { token, chatIds, ok: token.length > 0 && chatIds.length > 0 };
}

export interface LeadMessage {
  tour: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  contactMethod: 'telegram' | 'vk';
  contactHandle: string;
  comment: string;
}

export function formatLeadMessage(lead: LeadMessage, receivedAt: Date): string {
  const when = receivedAt.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const lines = [
    `Новая заявка: ${getProgram(lead.tour)?.title ?? lead.tour} (${getProgram(lead.tour)?.datesShort ?? ''})`,
    ...(lead.date ? [`Дата: ${lead.date}`] : []),
    '',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Связь: ${lead.contactMethod === 'vk' ? 'ВКонтакте' : 'Telegram'} - ${lead.contactHandle}`,
  ];
  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  lines.push('', `Получена: ${when} (МСК)`, 'Согласие на обработку ПДн: да');
  return lines.join('\n');
}

// Отправляет текст во все chat_id. Возвращает число успешных доставок.
// Текст уходит без parse_mode — ничего не нужно экранировать.
export async function sendToAll(text: string): Promise<{ delivered: number; total: number }> {
  const { token, chatIds } = getTelegramConfig();
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const results = await Promise.allSettled(
    chatIds.map(async (chatId, idx) => {
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        });
      } catch (err) {
        // Нет ответа от Telegram (таймаут, сеть заблокирована). Токен в лог не пишем.
        const reason = err instanceof Error && err.name === 'TimeoutError' ? 'нет ответа за 8 с' : 'ошибка сети';
        console.error(`[lead] telegram recipient #${idx + 1}: ${reason}`);
        throw err;
      }
      if (!res.ok) {
        // В лог — только номер получателя по списку и код ответа, без данных заявки.
        const info = await res.json().catch(() => ({}));
        console.error(`[lead] telegram recipient #${idx + 1}: HTTP ${res.status}`, info?.description ?? '');
        throw new Error(`HTTP ${res.status}`);
      }
    }),
  );

  const delivered = results.filter((r) => r.status === 'fulfilled').length;
  return { delivered, total: chatIds.length };
}

// Фото (до 10 штук) одним альбомом во все chat_id. Подпись — у первого фото (до 1024 символов).
// Возвращает число успешных доставок.
export async function sendPhotosToAll(
  photos: { data: Blob; name: string }[],
  caption: string,
): Promise<{ delivered: number; total: number }> {
  const { token, chatIds } = getTelegramConfig();
  if (photos.length === 0) return { delivered: chatIds.length, total: chatIds.length };
  const url = `https://api.telegram.org/bot${token}/sendMediaGroup`;

  const results = await Promise.allSettled(
    chatIds.map(async (chatId, idx) => {
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append(
        'media',
        JSON.stringify(
          photos.map((_, i) => ({ type: 'photo', media: `attach://photo${i}`, ...(i === 0 ? { caption: caption.slice(0, 1024) } : {}) })),
        ),
      );
      photos.forEach((p, i) => form.append(`photo${i}`, p.data, p.name));
      let res: Response;
      try {
        res = await fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(20000), cache: 'no-store' });
      } catch (err) {
        const reason = err instanceof Error && err.name === 'TimeoutError' ? 'нет ответа за 20 с' : 'ошибка сети';
        console.error(`[review] telegram photos recipient #${idx + 1}: ${reason}`);
        throw err;
      }
      if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        console.error(`[review] telegram photos recipient #${idx + 1}: HTTP ${res.status}`, info?.description ?? '');
        throw new Error(`HTTP ${res.status}`);
      }
    }),
  );
  return { delivered: results.filter((r) => r.status === 'fulfilled').length, total: chatIds.length };
}
