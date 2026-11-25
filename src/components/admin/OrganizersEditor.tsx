'use client';

import type { Organizer } from '@/lib/programs';
import type { Media } from './AdminApp';
import { Area, Empty, Field, inputCls, ItemList, Text, Tile, UploadButton } from './fields';

// Вкладка «Организаторы»: кто проводит программы. На странице программы — блок «Организаторы»:
// логотип и название, фото и имя человека, его роль в программе (задаётся в самой программе) и «О себе».

function slugify(s: string): string {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya' };
  return s.toLowerCase().split('').map((c) => map[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

export default function OrganizersEditor({ organizers, savedIds, media, onChange }: {
  organizers: Organizer[]; savedIds: string[]; media: Media; onChange: (o: Organizer[]) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        Здесь - сами организаторы. Кто проводит конкретную программу и в какой роли, выбирается в программе (блок «Организаторы программы»).
      </p>
      <ItemList items={organizers} onChange={onChange} addLabel="Добавить организатора"
        empty={(): Organizer => ({ id: '', org: '', person: '', photo: null, logo: null, link: null, contact: '@gregor_travel_ru' })}
        itemTitle={(o) => o.person || o.org || 'Новый организатор'}
        render={(o, set) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Text label="Имя и фамилия" value={o.person}
                onChange={(person) => set({ person, ...(savedIds.includes(o.id) ? {} : { id: slugify(person) }) })} />
              <Text label="Название (организация, проект)" value={o.org} onChange={(org) => set({ org })} />
              <Text label="Ссылка" hint="Сайт или страница ВК, необязательно" value={o.link ?? ''} placeholder="https://…" max={500}
                onChange={(link) => set({ link: link || null })} />
              <Text label="Telegram для связи" hint="Показывается, если заявка не ушла" value={o.contact} onChange={(contact) => set({ contact })} max={80} />
            </div>
            <Area label="О себе" rows={3} hint="Пара предложений под именем. Пусто - не показывается" value={o.about}
              onChange={(about) => set({ about: about || undefined })} max={2000} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Фото</div>
                {o.photo ? <Tile src={media.thumb(o.photo)} round onRemove={() => set({ photo: null })} /> : <Empty text="Нет фото" round />}
                <div className="mt-2">
                  <UploadButton label={o.photo ? 'Заменить' : 'Загрузить'} disabled={media.busy}
                    onFiles={async (f) => { const [src] = await media.upload('organizers', [f[0]]); if (src) set({ photo: src }); }} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Логотип</div>
                {o.logo ? <Tile src={media.thumb(o.logo)} round onRemove={() => set({ logo: null })} /> : <Empty text="Нет логотипа" round />}
                <div className="mt-2">
                  <UploadButton label={o.logo ? 'Заменить' : 'Загрузить'} disabled={media.busy}
                    onFiles={async (f) => { const [src] = await media.upload('organizers', [f[0]]); if (src) set({ logo: src }); }} />
                </div>
              </div>
            </div>
            <Field label="Код" hint={savedIds.includes(o.id) ? 'Служебный, после сохранения не меняется' : 'Служебный, латиницей - заполняется из имени'}>
              <input className={inputCls} value={o.id} disabled={savedIds.includes(o.id)} maxLength={40}
                onChange={(e) => set({ id: slugify(e.target.value) })} />
            </Field>
          </>
        )} />
    </div>
  );
}
