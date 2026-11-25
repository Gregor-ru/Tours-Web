import type { Metadata } from 'next';
import { connection } from 'next/server';
import { PROGRAMS } from '@/data/programs';
import { adminConfigured, isAdmin, storageMode } from '@/lib/admin';
import AdminLogin from '@/components/admin/AdminLogin';
import PhotoAdmin from '@/components/admin/PhotoAdmin';

// Админка фото для владельца: обложка, галерея и фото по дням каждой программы.
// Инструкция — ops/2026-11-25_admin-foto.md.
export const metadata: Metadata = { title: 'Фото программ - админка', robots: { index: false, follow: false } };

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

  const programs = PROGRAMS.map((p) => ({
    slug: p.slug,
    title: p.title,
    days: p.program.map((d) => ({ label: d.label ?? `День ${d.dayNumber}`, title: d.title })),
  }));
  return <PhotoAdmin programs={programs} mode={storageMode()} />;
}
