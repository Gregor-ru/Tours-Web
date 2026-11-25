import type { Organizer } from '@/lib/programs';
import data from './content/organizers.json';

// Организаторы — в src/data/content/organizers.json, правятся на /admin (вкладка «Организаторы»).
export const ORGANIZER_LIST = data as unknown as Organizer[];

export const ORGANIZERS: Record<string, Organizer> = Object.fromEntries(ORGANIZER_LIST.map((o) => [o.id, o]));
