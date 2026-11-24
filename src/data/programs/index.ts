import type { Program } from '@/lib/programs';
import { gudauri } from './gudauri';
import { iceClimbing } from './ice-climbing';
import { gubakha } from './gubakha';
import { yastrebinoe } from './yastrebinoe';

// Все программы, которые строятся по шаблону /tours/[slug].
// Новая программа: файл рядом + строка здесь. Порядок здесь = порядок в каталоге.
export const PROGRAMS: Program[] = [yastrebinoe, iceClimbing, gudauri, gubakha];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
