import type { Program } from '@/lib/programs';
import data from '../content/programs.json';
import { CONDITIONS_MD, GUBAKHA_CONDITIONS_MD } from '@/data/legal';

// Все программы (тексты, блоки, план по дням, фото) — в src/data/content/programs.json.
// Их правит владелец на /admin, сохранение — коммитом в GitHub (src/lib/admin.ts).
// Порядок в файле = порядок в каталоге. Страницы строятся по шаблону /tours/[slug].

// Условия участия — юридические тексты из legal/drafts (scripts/sync-legal.py), в админке не правятся.
const CONDITIONS: Record<string, string> = {
  gudauri: CONDITIONS_MD,
  gubakha: GUBAKHA_CONDITIONS_MD,
};

export const PROGRAMS: Program[] = (data as unknown as Program[]).map((p) => ({
  ...p,
  conditionsMd: CONDITIONS[p.slug],
}));

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
