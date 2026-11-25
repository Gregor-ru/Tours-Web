// Ограничение частоты запросов с одного IP: не больше max за windowMs.
// Хранится в памяти экземпляра функции (на Vercel их может быть несколько и они
// перезапускаются) — это «мягкая» защита от флуда, не строгая. IP не логируется.
import 'server-only';

export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function limited(ip: string, now: number): boolean {
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(ip, recent);
      return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) {
      for (const [key, times] of hits) {
        if (times.every((t) => now - t >= windowMs)) hits.delete(key);
      }
    }
    return false;
  };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
