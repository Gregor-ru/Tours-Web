'use client';

import type { Organizer } from '@/lib/programs';
import type { EquipmentItem, TourDay } from '@/lib/types';
import { usedPhotos, type ProgramData } from '@/lib/content';
import type { Media } from './AdminApp';
import { Area, Block, Empty, Field, inputCls, ItemList, move, PhotoGrid, PickButton, StringList, Text, Tile, UploadButton } from './fields';

// Редактор одной программы: все блоки страницы /tours/<slug>.

type Note = NonNullable<ProgramData['notes']>[number];

export default function ProgramEditor({ program: p, organizers, media, onChange }: {
  program: ProgramData; organizers: Organizer[]; media: Media; onChange: (p: ProgramData) => void;
}) {
  const set = (patch: Partial<ProgramData>) => onChange({ ...p, ...patch });
  const pool = () => usedPhotos(p);
  const upload = (files: File[]) => media.upload(p.slug, files);

  return (
    <div>
      <Block title="Основное" hint="Название, вид отдыха, место, раздел каталога" open>
        <Text label="Название" value={p.title} onChange={(title) => set({ title })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Text label="Вид отдыха" hint="Над заголовком и на карточке в каталоге" value={p.kind} onChange={(kind) => set({ kind })} />
          <Text label="Раздел каталога" hint="Например «Из Кирова», «Грузия»" value={p.catalogGroup} onChange={(catalogGroup) => set({ catalogGroup })} />
          <Text label="Страна" value={p.country} onChange={(country) => set({ country })} />
          <Text label="Регион" value={p.region} onChange={(region) => set({ region })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input type="checkbox" checked={!!p.draft} onChange={(e) => set({ draft: e.target.checked || undefined })} className="accent-[#E03C31]" />
          Пометка «скоро» (программа ещё готовится, форма — «Узнать первым»)
        </label>
      </Block>

      <Block title="Даты, цена и оплата">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Text label="Даты - подпись" hint="«16–23 января 2027», «4 выезда, январь–март 2027»" value={p.datesLabel} onChange={(datesLabel) => set({ datesLabel })} />
          <Text label="Даты - коротко" hint="Для сообщения о заявке в Telegram" value={p.datesShort} onChange={(datesShort) => set({ datesShort })} />
          <Field label="Цена, ₽">
            <input className={inputCls} type="number" inputMode="numeric" min={0} value={Number.isFinite(p.price) ? p.price : ''}
              onChange={(e) => set({ price: Number(e.target.value) })} />
          </Field>
          <Text label="Пометка к цене" hint="Например «предварительная цена». Пусто - без пометки" value={p.priceNote} onChange={(priceNote) => set({ priceNote: priceNote || undefined })} />
        </div>
        <StringList label="Варианты дат" hint="Если их несколько - в форме заявки появится выбор даты. Пусто - без выбора." items={p.dateOptions}
          onChange={(dateOptions) => set({ dateOptions: dateOptions.length ? dateOptions : undefined })} addLabel="Добавить дату" />
        <Area label="Оплата" rows={2} hint="Строка под стоимостью, например «предоплата 30%, полная оплата до 5 января»" value={p.payment}
          onChange={(payment) => set({ payment: payment || undefined })} max={600} />
        <Text label="Группа" hint="Например «до 17 человек»" value={p.groupSize} onChange={(groupSize) => set({ groupSize: groupSize || undefined })} />
      </Block>

      <Block title="Плитки и теги" hint="Четыре плитки с цифрами под заголовком и теги">
        <ItemList label="Плитки" items={p.stats} onChange={(stats) => set({ stats })} empty={() => ({ label: '', value: '' })} addLabel="Добавить плитку"
          itemTitle={(s, i) => s.value || `Плитка ${i + 1}`}
          render={(s, setS) => (
            <div className="grid grid-cols-2 gap-3">
              <Text label="Значение" value={s.value} onChange={(value) => setS({ value })} max={40} placeholder="3 дня" />
              <Text label="Подпись" value={s.label} onChange={(label) => setS({ label })} max={40} placeholder="Длительность" />
            </div>
          )} />
        <StringList label="Теги" items={p.tags} onChange={(tags) => set({ tags: tags.length ? tags : undefined })} addLabel="Добавить тег" />
      </Block>

      <Block title="Описание и «Что тебя ждёт»">
        <StringList label="Описание - абзацы" items={p.summary} onChange={(summary) => set({ summary })} multiline addLabel="Добавить абзац" />
        <ItemList label="Карточки «Что тебя ждёт»" hint="Пусто - блока не будет" items={p.features}
          onChange={(features) => set({ features: features.length ? features : undefined })}
          empty={() => ({ title: '', description: '' })} addLabel="Добавить карточку" itemTitle={(f, i) => f.title || `Карточка ${i + 1}`}
          render={(f, setF) => (
            <>
              <Text label="Заголовок" value={f.title} onChange={(title) => setF({ title })} />
              <Area label="Текст" rows={3} value={f.description} onChange={(description) => setF({ description })} max={600} />
            </>
          )} />
      </Block>

      <Block title="План по дням" hint="Тексты, расписание и фото каждого дня">
        <ItemList items={p.program} onChange={(program) => set({ program })} addLabel="Добавить день"
          empty={(): TourDay => ({ dayNumber: p.program.length + 1, title: '', shortDescription: '', fullDescription: '' })}
          itemTitle={(d, i) => `${d.label || `День ${d.dayNumber ?? i + 1}`}${d.title ? ` · ${d.title}` : ''}`}
          render={(d, setD) => (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Номер дня">
                  <input className={inputCls} type="number" value={d.dayNumber} onChange={(e) => setD({ dayNumber: Number(e.target.value) })} />
                </Field>
                <Text label="В кружке" hint="Вместо номера: «2–7», «чт»" value={d.badge} onChange={(badge) => setD({ badge: badge || undefined })} max={6} />
                <Text label="Подпись" hint="Вместо «День N»" value={d.label} onChange={(label) => setD({ label: label || undefined })} max={80} />
              </div>
              <Text label="Заголовок дня" value={d.title} onChange={(title) => setD({ title })} />
              <Area label="Кратко" rows={2} value={d.shortDescription} onChange={(shortDescription) => setD({ shortDescription })} max={600} />
              <Area label="Подробно" rows={5} hint="Пустая строка - новый абзац" value={d.fullDescription} onChange={(fullDescription) => setD({ fullDescription })} />
              <ItemList label="Расписание" items={d.hourlySchedule} onChange={(h) => setD({ hourlySchedule: h.length ? h : undefined })}
                empty={() => ({ time: '', activity: '' })} addLabel="Добавить строку" itemTitle={(h, i) => h.time || `${i + 1}`}
                render={(h, setH) => (
                  <div className="grid grid-cols-[6rem_1fr] gap-2">
                    <input className={inputCls} value={h.time} onChange={(e) => setH({ time: e.target.value })} placeholder="09:00" maxLength={20} />
                    <input className={inputCls} value={h.activity} onChange={(e) => setH({ activity: e.target.value })} placeholder="Что происходит" maxLength={200} />
                  </div>
                )} />
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Главное фото дня</div>
                <div className="max-w-xs">
                  {d.image ? <Tile src={media.thumb(d.image)} wide onRemove={() => setD({ image: undefined })} /> : <Empty text="Без фото - текст дня на всю ширину" />}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <UploadButton label={d.image ? 'Заменить' : 'Загрузить'} disabled={media.busy}
                    onFiles={async (f) => { const [src] = await upload([f[0]]); if (src) setD({ image: src }); }} />
                  <PickButton onClick={() => media.pick(pool(), (image) => setD({ image }))} />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">Ещё фото дня</div>
                <PhotoGrid>
                  {(d.images ?? []).map((src, i, arr) => (
                    <Tile key={`${src}-${i}`} src={media.thumb(src)}
                      onLeft={i > 0 ? () => setD({ images: move(arr, i, -1) }) : undefined}
                      onRight={i < arr.length - 1 ? () => setD({ images: move(arr, i, 1) }) : undefined}
                      onRemove={() => { const next = arr.filter((_, j) => j !== i); setD({ images: next.length ? next : undefined }); }} />
                  ))}
                </PhotoGrid>
                <div className="mt-2 flex flex-wrap gap-2">
                  <UploadButton label="Добавить" multiple disabled={media.busy}
                    onFiles={async (f) => { const srcs = await upload(f); if (srcs.length) setD({ images: [...(d.images ?? []), ...srcs] }); }} />
                  <PickButton onClick={() => media.pick(pool(), (src) => setD({ images: [...(d.images ?? []), src] }))} />
                </div>
              </div>
            </>
          )} />
      </Block>

      <Block title="Стоимость: включено и не включено">
        <StringList label="Включено" items={p.included} onChange={(included) => set({ included })} />
        <StringList label="Не включено" items={p.notIncluded} onChange={(notIncluded) => set({ notIncluded })} />
      </Block>

      <Block title="Что взять с собой" hint="Простой список или подробный список вещей по разделам">
        <StringList label="Простой список" hint="Показывается, если нет подробного списка" items={p.bring}
          onChange={(bring) => set({ bring: bring.length ? bring : undefined })} />
        <ItemList label="Подробный список по разделам" items={p.equipment}
          onChange={(equipment) => set({ equipment: equipment.length ? equipment : undefined })}
          empty={() => ({ title: '', items: [] })} addLabel="Добавить раздел" itemTitle={(s, i) => s.title || `Раздел ${i + 1}`}
          render={(s, setS) => (
            <>
              <Text label="Название раздела" value={s.title} onChange={(title) => setS({ title })} />
              <ItemList items={s.items} onChange={(items) => setS({ items })} empty={(): EquipmentItem => ({ name: '', required: true })} addLabel="Добавить вещь"
                itemTitle={(it, i) => it.name || `${i + 1}`}
                render={(it, setIt) => (
                  <>
                    <input className={inputCls} value={it.name} onChange={(e) => setIt({ name: e.target.value })} placeholder="Вещь" maxLength={200} />
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 text-sm text-gray-700">
                        <input type="checkbox" checked={it.required} onChange={(e) => setIt({ required: e.target.checked })} className="accent-[#E03C31]" /> обязательно
                      </label>
                      <input className={`${inputCls} flex-1 min-w-40`} value={it.note ?? ''} onChange={(e) => setIt({ note: e.target.value || undefined })} placeholder="Пояснение (необязательно)" maxLength={200} />
                    </div>
                  </>
                )} />
            </>
          )} />
      </Block>

      <Block title="Важное и «Ещё уточняется»">
        <ItemList label="Блоки «Важное»" hint="Отдельные блоки с заголовком, например «Скипасс», «Прокат снаряжения»" items={p.notes}
          onChange={(notes) => set({ notes: notes.length ? notes : undefined })}
          empty={(): Note => ({ title: '', text: '' })} addLabel="Добавить блок" itemTitle={(n, i) => n.title || `Блок ${i + 1}`}
          render={(n, setN) => (
            <>
              <Text label="Заголовок" value={n.title} onChange={(title) => setN({ title })} />
              <Area label="Текст" rows={3} value={n.text} onChange={(text) => setN({ text })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Text label="Ссылка-источник (необязательно)" value={n.link?.href} placeholder="https://…"
                  onChange={(href) => setN({ link: href ? { href, label: n.link?.label ?? '' } : undefined })} max={500} />
                <Text label="Текст ссылки" value={n.link?.label} onChange={(label) => setN({ link: n.link ? { ...n.link, label } : undefined })} />
              </div>
            </>
          )} />
        <StringList label="Ещё уточняется" hint="Каждая строка - жёлтая плашка «… - ❓ уточнить». Пусто - блока нет." items={p.placeholders}
          onChange={(placeholders) => set({ placeholders })} />
      </Block>

      <Block title="Частые вопросы">
        <ItemList items={p.faq} onChange={(faq) => set({ faq: faq.length ? faq : undefined })} empty={() => ({ question: '', answer: '' })}
          addLabel="Добавить вопрос" itemTitle={(f, i) => f.question || `Вопрос ${i + 1}`}
          render={(f, setF) => (
            <>
              <Text label="Вопрос" value={f.question} onChange={(question) => setF({ question })} />
              <Area label="Ответ" rows={3} value={f.answer} onChange={(answer) => setF({ answer })} />
            </>
          )} />
      </Block>

      <Block title="Организаторы программы" hint="Кто проводит. Сами организаторы (имя, фото, логотип) - на вкладке «Организаторы»">
        <ItemList items={p.organizers} onChange={(o) => set({ organizers: o })} empty={() => ({ id: organizers[0]?.id ?? '', role: '' })}
          addLabel="Добавить организатора" itemTitle={(o) => organizers.find((x) => x.id === o.id)?.person || o.id}
          render={(o, setO) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Кто">
                <select className={inputCls} value={o.id} onChange={(e) => setO({ id: e.target.value })}>
                  {organizers.map((x) => <option key={x.id} value={x.id}>{x.person || x.org}</option>)}
                </select>
              </Field>
              <Text label="Роль в этой программе" value={o.role} onChange={(role) => setO({ role })} placeholder="организатор и инструктор" />
            </div>
          )} />
      </Block>

      <Block title="Фото: обложка и галерея" hint="Большое фото наверху страницы и лента под ним">
        <div>
          <div className="text-sm font-medium text-gray-800 mb-1">Обложка</div>
          <div className="max-w-md">
            {p.cover ? (
              <Tile src={media.thumb(p.cover.src)} alt={p.cover.alt} wide
                onAlt={(alt) => set({ cover: p.cover && { ...p.cover, alt } })} onRemove={() => set({ cover: null })} />
            ) : <Empty text="Обложки нет" />}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <UploadButton label={p.cover ? 'Заменить' : 'Загрузить'} disabled={media.busy}
              onFiles={async (f) => { const [src] = await upload([f[0]]); if (src) set({ cover: { src, alt: p.cover?.alt ?? p.title } }); }} />
            <PickButton onClick={() => media.pick(pool(), (src) => set({ cover: { src, alt: p.cover?.alt ?? p.title } }))} />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800 mb-1">Галерея</div>
          <PhotoGrid>
            {p.gallery.map((g, i) => (
              <Tile key={`${g.src}-${i}`} src={media.thumb(g.src)} alt={g.alt}
                onAlt={(alt) => set({ gallery: p.gallery.map((x, j) => (j === i ? { ...x, alt } : x)) })}
                onLeft={i > 0 ? () => set({ gallery: move(p.gallery, i, -1) }) : undefined}
                onRight={i < p.gallery.length - 1 ? () => set({ gallery: move(p.gallery, i, 1) }) : undefined}
                onRemove={() => set({ gallery: p.gallery.filter((_, j) => j !== i) })} />
            ))}
          </PhotoGrid>
          <div className="mt-3 flex flex-wrap gap-2">
            <UploadButton label="Добавить фото" multiple disabled={media.busy}
              onFiles={async (f) => { const srcs = await upload(f); if (srcs.length) set({ gallery: [...p.gallery, ...srcs.map((src) => ({ src, alt: p.title }))] }); }} />
            <PickButton onClick={() => media.pick(pool(), (src) => set({ gallery: [...p.gallery, { src, alt: p.title }] }))} />
          </div>
        </div>
      </Block>
    </div>
  );
}
