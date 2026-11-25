import type { Metadata } from 'next';
import { connection } from 'next/server';
import { adminConfigured, isAdmin, storageMode } from '@/lib/admin';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminApp from '@/components/admin/AdminApp';

// Админка для владельца: тексты, блоки, план по дням и фото программ, организаторы.
// Инструкция — ops/2026-11-25_admin-foto.md.
export const metadata: Metadata = { title: 'Редактор сайта', robots: { index: false, follow: false } };

export default async function AdminPage() {
  await connection(); // всегда во время запроса: пароль и вход проверяются при каждом открытии
  if (!adminConfigured()) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-sm text-gray-700">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Админка не настроена</h1>
        <p>Задай пароль в переменной окружения ADMIN_PASSWORD (локально - в .env.local, на сайте - в Vercel) и перезапусти сайт.</p>
      </div>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;

  return <AdminApp mode={storageMode()} />;
}
