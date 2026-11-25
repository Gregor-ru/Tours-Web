// POST /api/admin/upload — загрузка одного фото из админки (multipart: file, slug).
// GitHub: фото уходит в репозиторий как blob, в коммит попадёт при «Сохранить».
// Локально (npm run dev без GitHub): файл пишется сразу в public/images/uploads/.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { isAdmin, storageMode } from '@/lib/admin';
import { uploadBlob } from '@/lib/github';
import { getProgram } from '@/data/programs';

const MAX_BYTES = 4_000_000;

function imageType(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const mode = storageMode();
  if (mode === 'none') return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const slug = String(form?.get('slug') ?? '');
  if (!getProgram(slug)) return Response.json({ ok: false, error: 'bad_program' }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) return Response.json({ ok: false, error: 'no_file' }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ ok: false, error: 'too_large' }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const ext = imageType(data);
  if (!ext) return Response.json({ ok: false, error: 'not_image' }, { status: 415 });

  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const name = `${stamp}-${randomBytes(3).toString('hex')}.${ext}`;
  const src = `/images/uploads/${slug}/${name}`;
  const path = `public${src}`;

  try {
    if (mode === 'github') {
      const sha = await uploadBlob(data);
      return Response.json({ ok: true, src, path, sha });
    }
    const dir = join(process.cwd(), 'public/images/uploads', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), data);
    return Response.json({ ok: true, src });
  } catch (e) {
    console.error('[admin] upload:', e instanceof Error ? e.message : e);
    return Response.json({ ok: false, error: 'storage_failed' }, { status: 502 });
  }
}
