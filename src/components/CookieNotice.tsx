'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Уведомление о cookie Яндекс Метрики. Информационное: Метрика грузится как раньше.
// Вариант строже (Метрика только после согласия) — см. legal/notes/2026-11-23_landing-pd.md.
const KEY = 'cookie-notice-v1';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export default function CookieNotice() {
  const pathname = usePathname();
  // На сервере считаем «закрыто», чтобы уведомление не мигало до гидратации
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);

  if (dismissed || pathname.startsWith('/admin')) return null; // в админке плашка мешает кнопке «Сохранить»

  const close = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* приватный режим — скроется до перезагрузки */
    }
    listeners.forEach((cb) => cb());
  };

  return (
    <div role="region" aria-label="Уведомление о cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4">
      <p className="text-xs text-gray-600 leading-relaxed">
        Сайт использует cookie и Яндекс Метрику, чтобы считать посещения. Подробнее - в{' '}
        <Link href="/privacy" className="underline hover:text-gray-900">политике обработки персональных данных</Link>.
        Отключить cookie можно в настройках браузера.
      </p>
      <button type="button" onClick={close}
        className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700">
        Понятно
      </button>
    </div>
  );
}
