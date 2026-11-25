'use client';

import { useState } from 'react';
import { LoaderCircle, Lock } from 'lucide-react';

const ERRORS: Record<string, string> = {
  wrong_password: 'Неверный пароль',
  rate_limited: 'Слишком много попыток. Подожди 15 минут.',
  not_configured: 'Пароль админки не задан на сервере.',
};

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok && data?.ok) {
      window.location.reload();
      return;
    }
    setError(ERRORS[data?.error] ?? 'Не получилось войти. Проверь интернет.');
    setBusy(false);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <Lock size={18} /> <h1 className="text-lg font-bold">Фото программ</h1>
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-800 mb-1">Пароль</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} autoFocus
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#E03C31] focus:outline-none focus:ring-2 focus:ring-[#E03C31]/20" />
        </div>
        {error && <p className="text-sm text-[#C33529]">{error}</p>}
        <button type="submit" disabled={busy || !password}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#E03C31] py-3 text-sm font-semibold text-white hover:bg-[#C33529] disabled:opacity-60">
          {busy && <LoaderCircle size={16} className="animate-spin" />} Войти
        </button>
      </form>
    </div>
  );
}
