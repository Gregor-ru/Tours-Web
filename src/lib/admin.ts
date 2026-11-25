// Админка фото (/admin): вход по паролю и хранилище.
// Пароль — ADMIN_PASSWORD (Vercel env). Сохранение — коммитом в GitHub (GITHUB_TOKEN, GITHUB_REPO,
// GITHUB_BRANCH), после коммита Vercel сам пересобирает сайт. Без GitHub при `npm run dev`
// изменения пишутся прямо в файлы проекта (локальный режим).
// Инструкция — ops/2026-11-25_admin-foto.md.
import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'gt_admin';
const SESSION_DAYS = 30;

export type StorageMode = 'github' | 'local' | 'none';

export function storageMode(): StorageMode {
  if (process.env.GITHUB_TOKEN?.trim() && process.env.GITHUB_REPO?.trim()) return 'github';
  if (process.env.NODE_ENV === 'development') return 'local';
  return 'none';
}

function secret(): string | null {
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!pass) return null;
  // Сессии подписываются ключом из пароля: сменил пароль — все старые входы недействительны.
  return createHash('sha256').update(`gt-admin:${pass}:${process.env.ADMIN_SESSION_SECRET ?? ''}`).digest('hex');
}

export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD?.trim();
}

export function checkPassword(input: string): boolean {
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!pass) return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(pass).digest();
  return timingSafeEqual(a, b);
}

function sign(exp: number, key: string): string {
  return createHmac('sha256', key).update(`admin:${exp}`).digest('hex');
}

export function newSession(): { value: string; maxAge: number } {
  const key = secret();
  if (!key) throw new Error('ADMIN_PASSWORD не задан');
  const maxAge = SESSION_DAYS * 24 * 3600;
  const exp = Math.floor(Date.now() / 1000) + maxAge;
  return { value: `${exp}.${sign(exp, key)}`, maxAge };
}

export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value ?? '';
  const [expStr, sig] = raw.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  const good = Buffer.from(sign(exp, key));
  const got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got);
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge,
});
