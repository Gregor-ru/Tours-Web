// Заявка с сайта: общие типы и валидация для формы (клиент) и route handler (сервер).
// Минимизация ПДн (152-ФЗ): только эти поля, ничего лишнего — без паспортов, здоровья, дат рождения.

export type ContactMethod = 'telegram' | 'vk';

export interface LeadInput {
  tour: string; // slug тура
  date: string; // выбранная дата (если у программы несколько дат), иначе ''
  name: string;
  phone: string;
  email: string;
  contactMethod: ContactMethod;
  contactHandle: string; // ник в Telegram или ссылка/ник ВКонтакте
  comment: string; // необязательно
  consent: boolean; // согласие на обработку ПДн
  // Антиспам
  website: string; // honeypot: скрытое поле, человек его не заполняет
  fillMs: number; // сколько мс прошло от первого касания формы до отправки; слишком быстро — бот
}

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

export const LIMITS = {
  name: 80,
  phone: 30,
  email: 120,
  contactHandle: 120,
  comment: 1000,
};

// Убираем управляющие символы и лишние пробелы по краям.
export function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function validateLead(input: LeadInput, dateOptions?: string[]): LeadErrors {
  const errors: LeadErrors = {};

  if (dateOptions && dateOptions.length > 0 && !dateOptions.includes(input.date)) {
    errors.date = 'Выбери дату';
  }

  if (input.name.length < 2) errors.name = 'Напиши, как к тебе обращаться';

  const digits = phoneDigits(input.phone);
  if (!/^[\d\s()+\-]+$/.test(input.phone) || digits.length < 10 || digits.length > 15) {
    errors.phone = 'Проверь номер телефона';
  }

  if (!EMAIL_RE.test(input.email)) errors.email = 'Проверь email';

  if (input.contactMethod !== 'telegram' && input.contactMethod !== 'vk') {
    errors.contactMethod = 'Выбери, где удобнее общаться';
  }

  if (input.contactHandle.length < 2) {
    errors.contactHandle =
      input.contactMethod === 'vk' ? 'Укажи ссылку или ник ВКонтакте' : 'Укажи ник в Telegram';
  }

  if (input.consent !== true) errors.consent = 'Без согласия я не смогу обработать заявку';

  return errors;
}

// Нормализация тела запроса на сервере (не доверяем клиенту).
export function parseLead(body: unknown): LeadInput {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return {
    tour: clean(b.tour, 40),
    date: clean(b.date, 40),
    name: clean(b.name, LIMITS.name),
    phone: clean(b.phone, LIMITS.phone),
    email: clean(b.email, LIMITS.email).toLowerCase(),
    contactMethod: b.contactMethod === 'vk' ? 'vk' : b.contactMethod === 'telegram' ? 'telegram' : ('' as ContactMethod),
    contactHandle: clean(b.contactHandle, LIMITS.contactHandle),
    comment: clean(b.comment, LIMITS.comment),
    consent: b.consent === true,
    website: clean(b.website, 200),
    fillMs: typeof b.fillMs === 'number' && Number.isFinite(b.fillMs) ? b.fillMs : 0,
  };
}
