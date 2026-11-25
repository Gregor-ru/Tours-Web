// GET /api/admin/photos — текущая раскладка фото (из GitHub — самая свежая, иначе из файлов проекта).
// POST /api/admin/photos {slug, photos, uploads} — сохранить раскладку одной программы.
// GitHub: один коммит (photos.json + новые фото) → Vercel пересобирает сайт за 1–2 минуты.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isAdmin, storageMode } from '@/lib/admin';
import { commitFiles, readRepoFile } from '@/lib/github';
import { parseProgramPhotos, type PhotoLayout } from '@/lib/photo-layout';
import { getProgram } from '@/data/programs';
import bundled from '@/data/photos.json';

const LAYOUT_PATH = 'src/data/photos.json';

async function currentLayout(): Promise<PhotoLayout> {
  const mode = storageMode();
  if (mode === 'github') return JSON.parse(await readRepoFile(LAYOUT_PATH));
  if (mode === 'local') return JSON.parse(readFileSync(join(process.cwd(), LAYOUT_PATH), 'utf8'));
  return bundled as PhotoLayout;
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    return Response.json({ ok: true, mode: storageMode(), layout: await currentLayout() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[admin] read layout:', e instanceof Error ? e.message : e);
    return Response.json({ ok: false, error: 'storage_failed' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const mode = storageMode();
  if (mode === 'none') return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug ?? '');
  const program = getProgram(slug);
  if (!program) return Response.json({ ok: false, error: 'bad_program' }, { status: 400 });
  const photos = parseProgramPhotos(body?.photos, program.program.length);
  if (!photos) return Response.json({ ok: false, error: 'bad_layout' }, { status: 400 });

  // Новые фото, загруженные в этой правке: путь строго в своей папке, sha — от GitHub
  const uploadsIn: unknown[] = Array.isArray(body?.uploads) ? body.uploads : [];
  const uploads = uploadsIn
    .map((u) => u as { path?: unknown; sha?: unknown })
    .filter((u) => typeof u.path === 'string' && u.path.startsWith(`public/images/uploads/${slug}/`) && !u.path.includes('..')
      && typeof u.sha === 'string' && /^[0-9a-f]{40}$/.test(u.sha))
    .map((u) => ({ path: u.path as string, sha: u.sha as string }));

  // В коммит берём только те новые фото, что реально стоят на странице
  const used = new Set([photos.cover?.src, ...photos.gallery.map((g) => g.src), ...photos.days.flatMap((d) => [d.image, ...d.images])]);
  const keep = uploads.filter((u) => used.has(u.path.slice('public'.length)));

  try {
    const layout = await currentLayout();
    layout[slug] = photos;
    const json = JSON.stringify(layout, null, 2) + '\n';
    if (mode === 'github') {
      const sha = await commitFiles([...keep, { path: LAYOUT_PATH, content: json }], `Фото: ${program.title} (правка в /admin)`);
      return Response.json({ ok: true, mode, commit: sha.slice(0, 7) });
    }
    writeFileSync(join(process.cwd(), LAYOUT_PATH), json);
    return Response.json({ ok: true, mode });
  } catch (e) {
    console.error('[admin] save:', e instanceof Error ? e.message : e);
    return Response.json({ ok: false, error: 'storage_failed' }, { status: 502 });
  }
}
