// GET /api/admin/content — программы и организаторы для админки (из GitHub — самые свежие).
// POST /api/admin/content — сохранить одну программу ({kind:'program', slug, data, uploads})
// или список организаторов ({kind:'organizers', data, uploads}). GitHub: один коммит → Vercel пересобирает сайт.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isAdmin, storageMode } from '@/lib/admin';
import { commitFiles, readRepoFile } from '@/lib/github';
import { parseOrganizers, parseProgram, usedPhotos, type ProgramData } from '@/lib/content';
import type { Organizer } from '@/lib/programs';
import bundledPrograms from '@/data/content/programs.json';
import bundledOrganizers from '@/data/content/organizers.json';

const PROGRAMS_PATH = 'src/data/content/programs.json';
const ORGANIZERS_PATH = 'src/data/content/organizers.json';

async function read<T>(path: string, bundled: unknown): Promise<T> {
  const mode = storageMode();
  if (mode === 'github') return JSON.parse(await readRepoFile(path));
  if (mode === 'local') return JSON.parse(readFileSync(join(process.cwd(), path), 'utf8'));
  return bundled as T;
}

const toJson = (v: unknown) => JSON.stringify(v, null, 2) + '\n';

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Новые фото этой правки: путь строго в своей папке, sha — от GitHub; в коммит — только те, что стоят на странице.
function pickUploads(raw: unknown, folder: string, used: Set<string>) {
  return (Array.isArray(raw) ? raw : [])
    .map((u) => (u ?? {}) as { path?: unknown; sha?: unknown })
    .filter((u): u is { path: string; sha: string } =>
      typeof u.path === 'string' && u.path.startsWith(`public/images/uploads/${folder}/`) && !u.path.includes('..') &&
      typeof u.sha === 'string' && /^[0-9a-f]{40}$/.test(u.sha))
    .filter((u) => used.has(u.path.slice('public'.length)))
    .map((u) => ({ path: u.path, sha: u.sha }));
}

export async function GET() {
  if (!(await isAdmin())) return json(401, { ok: false, error: 'unauthorized' });
  try {
    const [programs, organizers] = await Promise.all([
      read<ProgramData[]>(PROGRAMS_PATH, bundledPrograms),
      read<Organizer[]>(ORGANIZERS_PATH, bundledOrganizers),
    ]);
    return json(200, { ok: true, mode: storageMode(), programs, organizers });
  } catch (e) {
    console.error('[admin] read:', e instanceof Error ? e.message : e);
    return json(502, { ok: false, error: 'storage_failed' });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return json(401, { ok: false, error: 'unauthorized' });
  const mode = storageMode();
  if (mode === 'none') return json(503, { ok: false, error: 'not_configured' });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json(400, { ok: false, error: 'bad_request' });

  try {
    const organizers = await read<Organizer[]>(ORGANIZERS_PATH, bundledOrganizers);

    if (body.kind === 'program') {
      const programs = await read<ProgramData[]>(PROGRAMS_PATH, bundledPrograms);
      const slug = String(body.slug ?? '');
      const idx = programs.findIndex((p) => p.slug === slug);
      if (idx < 0) return json(400, { ok: false, error: 'bad_program' });
      const parsed = parseProgram(body.data, programs[idx], organizers.map((o) => o.id));
      if ('error' in parsed) return json(422, { ok: false, error: 'validation', message: parsed.error });
      programs[idx] = parsed;
      const uploads = pickUploads(body.uploads, slug, new Set(usedPhotos(parsed)));
      return json(200, { ok: true, mode, ...(await store([...uploads, { path: PROGRAMS_PATH, content: toJson(programs) }], `Сайт: ${parsed.title} (правка в /admin)`)) });
    }

    if (body.kind === 'organizers') {
      const parsed = parseOrganizers(body.data);
      if ('error' in parsed) return json(422, { ok: false, error: 'validation', message: parsed.error });
      // Нельзя убрать организатора, который указан в программе
      const programs = await read<ProgramData[]>(PROGRAMS_PATH, bundledPrograms);
      const ids = new Set(parsed.map((o) => o.id));
      const missing = programs.flatMap((p) => p.organizers.filter((o) => !ids.has(o.id)).map((o) => `${o.id} (${p.title})`));
      if (missing.length) return json(422, { ok: false, error: 'validation', message: `Этот организатор указан в программе: ${missing.join(', ')}. Сначала убери его из программы.` });
      const used = new Set(parsed.flatMap((o) => [o.photo, o.logo]).filter((x): x is string => !!x));
      const uploads = pickUploads(body.uploads, 'organizers', used);
      return json(200, { ok: true, mode, ...(await store([...uploads, { path: ORGANIZERS_PATH, content: toJson(parsed) }], 'Сайт: организаторы (правка в /admin)')) });
    }

    return json(400, { ok: false, error: 'bad_request' });
  } catch (e) {
    console.error('[admin] save:', e instanceof Error ? e.message : e);
    return json(502, { ok: false, error: 'storage_failed' });
  }
}

async function store(files: { path: string; sha?: string; content?: string }[], message: string) {
  if (storageMode() === 'github') {
    const sha = await commitFiles(files, message);
    return { commit: sha.slice(0, 7) };
  }
  for (const f of files) if (f.content !== undefined) writeFileSync(join(process.cwd(), f.path), f.content);
  return {};
}
