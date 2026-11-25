// POST /api/admin/login {password} — вход в админку фото. DELETE — выход.
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminConfigured, checkPassword, cookieOptions, newSession } from '@/lib/admin';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

const limited = createRateLimiter(5, 15 * 60 * 1000); // 5 попыток за 15 минут с одного IP

export async function POST(request: Request) {
  if (!adminConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (limited(clientIp(request), Date.now())) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  if (!checkPassword(password)) return Response.json({ ok: false, error: 'wrong_password' }, { status: 401 });
  const s = newSession();
  (await cookies()).set(ADMIN_COOKIE, s.value, cookieOptions(s.maxAge));
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
