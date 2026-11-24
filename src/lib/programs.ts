// Модель «программы» (карточки тура) для каталога. Новая программа = один файл в src/data/programs/
// и строка в src/data/programs/index.ts. Страницы строятся по шаблону /tours/[slug].
// Факты — только из docs/FACTS.md; чего нет — в placeholders (на сайте «❓ уточнить»).

import type { EquipmentSection, FAQ, TourDay, TourFeature } from '@/lib/types';

export const TODO_OWNER = '❓ уточнить';

export type OrganizerId = 'eg' | 'severny';

export interface Organizer {
  id: OrganizerId;
  org: string; // как называем организатора на сайте
  person: string;
  logo: string | null;
  link: string | null;
  contact: string; // Telegram для связи, если заявка не ушла
}

export interface Photo {
  src: string;
  alt: string;
}

export interface PhotoCredit {
  what: string;
  author: string;
  license: string; // «CC BY 2.0», «CC0» — ссылка на текст лицензии подставляется сама (components/PhotoCredits)
  url: string; // страница файла-источника
}

export interface OperatorInfo {
  name: string | null;
  innOgrn: string | null;
  registryNumber: string | null;
  registryUrl: string | null;
  address: string | null;
  financialSecurity: string | null;
  contacts: string | null;
  sellerRole: string | null;
  document: { href: string; label: string } | null;
}

export interface Program {
  slug: string;
  title: string;
  kind: string; // «Горные лыжи и сноуборд», «Ледолазание»
  country: string;
  region: string;
  catalogGroup: string; // раздел каталога
  draft?: boolean; // заглушка: в каталоге с пометкой «скоро», форма заявки — «лист ожидания»
  datesLabel: string;
  datesShort: string;
  dateOptions?: string[]; // если есть — в форме выбор даты
  price: number;
  priceNote?: string; // «предварительная цена»
  stats: { label: string; value: string }[]; // плитки с ключевыми цифрами под заголовком (до 4)
  tags?: string[];
  summary: string[];
  features?: TourFeature[]; // карточки «Что тебя ждёт»
  included: string[];
  notIncluded: string[];
  payment?: string;
  bring?: string[]; // «Что взять с собой» — простой список
  equipment?: EquipmentSection[]; // или подробный список вещей по разделам (вместо bring)
  faq?: FAQ[];
  program: TourDay[]; // план по дням — тот же формат и вид, что у Ястребиного (TourDayPlan)
  organizers: { id: OrganizerId; role: string; photo: string | null }[];
  groupSize?: string;
  cover: Photo | null;
  gallery: Photo[]; // все фото идут в галерею наверху страницы (обложка — первой)
  photoCredits: PhotoCredit[];
  placeholders: string[]; // что ещё не заполнено — «❓ уточнить»
  notes?: { title: string; text: string; link?: { href: string; label: string } }[];
  conditionsMd?: string; // вкладка «Условия участия»
  operator?: OperatorInfo; // вкладка «Туроператор»
}

// Пункты меню страницы программы (id = id раздела на странице /tours/[slug]).
export function programSections(p: Program): { id: string; label: string }[] {
  return [
    { id: 'about', label: 'О туре' },
    ...(p.program.length > 0 ? [{ id: 'program', label: 'Программа' }] : []),
    { id: 'price', label: 'Стоимость' },
    ...(p.equipment?.length || p.bring?.length ? [{ id: 'bring', label: 'Что взять' }] : []),
    ...(p.faq?.length ? [{ id: 'faq', label: 'Вопросы' }] : []),
    { id: 'team', label: p.organizers.length > 1 ? 'Организаторы' : 'Организатор' },
    { id: 'lead', label: 'Заявка' },
  ];
}
