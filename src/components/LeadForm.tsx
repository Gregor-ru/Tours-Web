'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Send, LoaderCircle, CircleCheck } from 'lucide-react';
import { LIMITS, validateLead, type ContactMethod, type LeadErrors, type LeadInput } from '@/lib/lead';
import { reachGoal } from '@/lib/metrika';

interface Props {
  tour: string;
  telegramContact: string; // запасной контакт, если отправка не удалась
  dateOptions?: string[]; // если есть — выбор даты
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const SERVER_ERRORS: Record<string, string> = {
  rate_limited: 'Слишком много заявок подряд. Подожди 10 минут или напиши мне напрямую.',
  not_configured: 'Форма пока не подключена. Напиши мне напрямую, пожалуйста.',
  delivery_failed: 'Заявка не дошла. Попробуй ещё раз или напиши мне напрямую.',
};

export default function LeadForm({ tour, telegramContact, dateOptions }: Props) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [contactHandle, setContactHandle] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false); // не предзаполнено
  const [website, setWebsite] = useState(''); // honeypot
  // Время первого касания формы — для отсева слишком быстрых (ботовых) отправок
  const startedAt = useRef(0);

  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');

  const markStart = () => {
    if (!startedAt.current) startedAt.current = Date.now();
  };

  const buildInput = (): LeadInput => ({
    tour,
    date,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    contactMethod,
    contactHandle: contactHandle.trim(),
    comment: comment.trim(),
    consent,
    website,
    fillMs: startedAt.current ? Date.now() - startedAt.current : 0,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const input = buildInput();
    const found = validateLead(input, dateOptions);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
        reachGoal('booking_click', { tour });
        return;
      }
      if (data.error === 'validation' && data.fields) setErrors(data.fields);
      setServerError(SERVER_ERRORS[data.error] ?? 'Что-то пошло не так. Проверь поля или напиши мне напрямую.');
      setStatus('error');
    } catch {
      setServerError('Нет связи с сервером. Проверь интернет или напиши мне напрямую.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CircleCheck className="mx-auto text-green-600 mb-3" size={36} />
        <p className="font-semibold text-gray-900">Заявка отправлена</p>
        <p className="text-sm text-gray-600 mt-1">
          Я напишу тебе в {contactMethod === 'vk' ? 'ВКонтакте' : 'Telegram'}. Если долго нет ответа - пиши в Telegram{' '}
          <a className="underline" href={`https://t.me/${telegramContact.replace('@', '')}`}>{telegramContact}</a>.
        </p>
      </div>
    );
  }

  const field =
    'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E03C31] focus:outline-none focus:ring-2 focus:ring-[#E03C31]/20';
  const errorText = (key: keyof LeadErrors) =>
    errors[key] ? <p id={`${key}-error`} className="mt-1 text-xs text-[#C33529]">{errors[key]}</p> : null;

  return (
    <form onSubmit={onSubmit} onFocusCapture={markStart} onPointerDownCapture={markStart} noValidate className="space-y-4">
      {dateOptions && dateOptions.length > 0 && (
        <div>
          <label htmlFor="lead-date" className="block text-sm font-medium text-gray-800 mb-1">Дата</label>
          <select id="lead-date" className={field} value={date} onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined}>
            <option value="">Выбери дату</option>
            {dateOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errorText('date')}
        </div>
      )}

      <div>
        <label htmlFor="lead-name" className="block text-sm font-medium text-gray-800 mb-1">Имя</label>
        <input id="lead-name" className={field} value={name} onChange={(e) => setName(e.target.value)}
          maxLength={LIMITS.name} autoComplete="given-name" aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined} />
        {errorText('name')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-800 mb-1">Телефон</label>
          <input id="lead-phone" type="tel" inputMode="tel" className={field} value={phone}
            onChange={(e) => setPhone(e.target.value)} maxLength={LIMITS.phone} autoComplete="tel"
            placeholder="+7 900 000-00-00" aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined} />
          {errorText('phone')}
        </div>
        <div>
          <label htmlFor="lead-email" className="block text-sm font-medium text-gray-800 mb-1">Email</label>
          <input id="lead-email" type="email" inputMode="email" className={field} value={email}
            onChange={(e) => setEmail(e.target.value)} maxLength={LIMITS.email} autoComplete="email"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
          {errorText('email')}
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-800 mb-1.5">Где удобнее общаться</legend>
        <div className="flex gap-2">
          {([
            ['telegram', 'Telegram'],
            ['vk', 'ВКонтакте'],
          ] as const).map(([value, label]) => (
            <label key={value}
              className={`flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                contactMethod === value
                  ? 'border-[#E03C31] bg-[#E03C31]/5 text-[#C33529]'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}>
              <input type="radio" name="contactMethod" value={value} className="sr-only"
                checked={contactMethod === value} onChange={() => setContactMethod(value)} />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-2">
          <label htmlFor="lead-handle" className="sr-only">
            {contactMethod === 'vk' ? 'Ссылка или ник ВКонтакте' : 'Ник в Telegram'}
          </label>
          <input id="lead-handle" className={field} value={contactHandle}
            onChange={(e) => setContactHandle(e.target.value)} maxLength={LIMITS.contactHandle}
            placeholder={contactMethod === 'vk' ? 'vk.com/твой_ник' : '@твой_ник'}
            aria-invalid={!!errors.contactHandle}
            aria-describedby={errors.contactHandle ? 'contactHandle-error' : undefined} />
          {errorText('contactHandle')}
        </div>
      </fieldset>

      <div>
        <label htmlFor="lead-comment" className="block text-sm font-medium text-gray-800 mb-1">
          Комментарий <span className="font-normal text-gray-400">- необязательно</span>
        </label>
        <textarea id="lead-comment" rows={3} className={field} value={comment}
          onChange={(e) => setComment(e.target.value)} maxLength={LIMITS.comment}
          placeholder="Вопросы, с кем едешь, откуда летишь" />
      </div>

      {/* Honeypot: скрыт от людей и скринридеров, боты его заполняют */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="lead-website">Сайт</label>
        <input id="lead-website" tabIndex={-1} autoComplete="off" value={website}
          onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {/* Согласие на обработку ПДн — отдельный чекбокс, не отмечен по умолчанию (152-ФЗ, ст. 9) */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#E03C31]" aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span className="text-xs text-gray-600 leading-relaxed">
            Даю{' '}
            <Link href="/consent" target="_blank" className="underline hover:text-gray-900">
              согласие на обработку персональных данных
            </Link>{' '}
            на условиях{' '}
            <Link href="/privacy" target="_blank" className="underline hover:text-gray-900">
              политики обработки персональных данных
            </Link>
            .
          </span>
        </label>
        {errorText('consent')}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-[#C33529]">
          {serverError}{' '}
          <a className="underline" href={`https://t.me/${telegramContact.replace('@', '')}`}>{telegramContact}</a>
        </p>
      )}

      <button type="submit" disabled={status === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#E03C31] hover:bg-[#C33529] disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-3.5 text-sm transition-colors">
        {status === 'sending' ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
        {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
      </button>
    </form>
  );
}
