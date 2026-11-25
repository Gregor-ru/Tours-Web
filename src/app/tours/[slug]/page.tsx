import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ExternalLink, UserRound, X } from 'lucide-react';
import { PROGRAMS, getProgram } from '@/data/programs';
import { ORGANIZERS } from '@/data/organizers';
import { TODO_OWNER } from '@/lib/programs';
import { usedPhotos } from '@/lib/content';
import LeadForm from '@/components/LeadForm';
import MobileLeadBar from '@/components/MobileLeadBar';
import OrgLogo from '@/components/OrgLogo';
import PhotoCredits from '@/components/PhotoCredits';
import ReviewsBlock from '@/components/ReviewsBlock';
import TourDayPlan from '@/components/TourDayPlan';
import TourEquipment from '@/components/TourEquipment';
import TourFAQ from '@/components/TourFAQ';

// Страница любой программы. Блоки и их порядок одинаковы у всех туров:
// О туре → Программа → Стоимость (включено / не включено / оплата, условия) → Что взять →
// важное → что уточняется → Вопросы → Организаторы → Отзывы; справа (на телефоне — внизу) заявка.
// Блок без данных не показывается.

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) return {};
  return {
    title: `${p.title}, ${p.datesLabel}`,
    description: `${p.kind}, ${p.region}. ${p.price.toLocaleString('ru-RU')} ₽${p.priceNote ? ` (${p.priceNote})` : ''}.`,
  };
}

const section = 'scroll-mt-32';
const h2 = 'text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5';
const leadButton = 'inline-block bg-[#E03C31] hover:bg-[#C33529] active:scale-95 text-white font-semibold rounded-lg px-8 py-3.5 text-sm transition-all';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="font-semibold">{title}:</span> {TODO_OWNER}
    </div>
  );
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgram(slug);
  if (!p) notFound();
  const mainContact = ORGANIZERS[p.organizers[0]?.id]?.contact ?? '@gregor_travel_ru';
  const leadLabel = p.draft ? 'Узнать первым' : 'Оставить заявку';
  const price = `${p.price.toLocaleString('ru-RU')} ₽`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 min-w-0 space-y-10 sm:space-y-12">

          {/* О туре */}
          <section id="about" className={section}>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
              <span>{p.kind}</span>
              <span aria-hidden>·</span>
              <span>{p.datesLabel}</span>
              {p.draft && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">скоро</span>}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{p.title}</h1>

            {p.tags && p.tags.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                {p.tags.map((tag) => (
                  <span key={tag} className="flex-shrink-0 text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1.5">{tag}</span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
              {p.stats.map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-sm sm:text-base text-gray-700 leading-7 space-y-4">
              {p.summary.map((t) => <p key={t}>{t}</p>)}
            </div>

            {p.dateOptions && p.dateOptions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Даты</h3>
                <div className="flex flex-wrap gap-2">
                  {p.dateOptions.map((d) => (
                    <span key={d} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {p.features && p.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Что тебя ждёт</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.features.map((f) => (
                    <div key={f.title} className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden sm:block mt-8">
              <a href="#lead" className={leadButton}>{leadLabel}</a>
            </div>
          </section>

          {/* Программа */}
          {p.program.length > 0 && (
            <section id="program" className={section}>
              <h2 className={h2}>План по дням</h2>
              <TourDayPlan days={p.program} />
            </section>
          )}

          {/* Стоимость */}
          <section id="price" className={section}>
            <h2 className={h2}>Стоимость</h2>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <span className="text-gray-600 text-sm">На человека{p.priceNote ? ` - ${p.priceNote}` : ''}</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 flex-shrink-0">{price}</span>
              </div>
              {(p.included.length > 0 || p.notIncluded.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200 bg-white">
                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Включено</h3>
                    <ul className="space-y-2">
                      {p.included.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-gray-800">
                          <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Не включено</h3>
                    <ul className="space-y-2">
                      {p.notIncluded.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-gray-500">
                          <X size={16} className="text-gray-300 flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {(p.payment || p.conditionsMd) && (
                <div className="p-4 sm:p-5 border-t border-gray-200 text-sm text-gray-700">
                  {p.payment && <><b>Оплата:</b> {p.payment}.{' '}</>}
                  {p.conditionsMd && (
                    <Link href={`/tours/${p.slug}/conditions`} className="underline hover:text-gray-900">Условия участия</Link>
                  )}
                </div>
              )}
              <div className="p-4 sm:p-5 border-t border-gray-200">
                <a href="#lead" className={leadButton}>{leadLabel}</a>
              </div>
            </div>
          </section>

          {/* Что взять с собой */}
          {(p.equipment?.length || p.bring?.length) ? (
            <section id="bring" className={section}>
              <h2 className={h2}>Что взять с собой</h2>
              {p.equipment?.length ? (
                <TourEquipment equipment={p.equipment} />
              ) : (
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  {p.bring!.map((b) => (
                    <li key={b} className="flex gap-2.5"><Check size={16} className="text-[#E03C31] flex-shrink-0 mt-1" /> {b}</li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {/* Важное */}
          {p.notes?.map((n) => (
            <section key={n.title}>
              <h2 className={h2}>{n.title}</h2>
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5 text-sm text-gray-700 leading-relaxed space-y-2">
                <p>{n.text}</p>
                {n.link && (
                  <p className="text-gray-500">
                    Источник:{' '}
                    <a href={n.link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline hover:text-gray-900">
                      {n.link.label} <ExternalLink size={12} />
                    </a>
                  </p>
                )}
              </div>
            </section>
          ))}

          {p.placeholders.length > 0 && (
            <section id="details">
              <h2 className={h2}>Ещё уточняется</h2>
              <div className="space-y-2.5">
                {p.placeholders.map((t) => <Placeholder key={t} title={t} />)}
              </div>
            </section>
          )}

          {/* Вопросы */}
          {p.faq && p.faq.length > 0 && (
            <section id="faq" className={section}>
              <h2 className={h2}>Частые вопросы</h2>
              <TourFAQ faq={p.faq} />
            </section>
          )}

          {/* Организаторы */}
          <section id="team" className={section}>
            <h2 className={h2}>{p.organizers.length > 1 ? 'Организаторы' : 'Организатор'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {p.organizers.map(({ id, role }) => {
                const o = ORGANIZERS[id];
                if (!o) return null;
                const photo = o.photo;
                return (
                  <div key={id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-gray-100">
                      <OrgLogo src={o.logo} name={o.org} size={32} />
                      {o.link ? (
                        <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 underline">{o.org}</a>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{o.org}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                        {photo ? (
                          <Image src={photo} alt={o.person} fill sizes="64px" className="object-cover" />
                        ) : (
                          <UserRound size={28} className="text-gray-300" aria-label="Фото скоро будет" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{o.person}</div>
                        <div className="text-sm text-gray-500">{role}</div>
                      </div>
                    </div>
                    {o.about && <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{o.about}</p>}
                  </div>
                );
              })}
            </div>
            {p.groupSize && <p className="mt-3 text-sm text-gray-500">Группа - {p.groupSize}.</p>}
          </section>

          <ReviewsBlock slug={p.slug} demoPhotos={p.gallery.slice(0, 3).map((g) => g.src)} />

          <PhotoCredits credits={p.photoCredits.filter((c) => usedPhotos(p).includes(c.src))} />
        </div>

        {/* Заявка */}
        <aside id="lead" className={`lg:col-span-1 ${section}`}>
          <div className="lg:sticky lg:top-[128px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Цена{p.priceNote ? ` - ${p.priceNote}` : ''}</div>
              <div className="text-3xl font-bold text-gray-900">{price}</div>
              <div className="text-sm text-gray-500 mt-1">{p.datesLabel}</div>
            </div>
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">{p.draft ? 'Узнать первым' : 'Заявка'}</h2>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                {p.draft
                  ? 'Даты и детали ещё уточняются. Оставь контакты - напишем, когда всё будет готово.'
                  : p.organizers[0]?.id === 'eg'
                    ? 'Оставь контакты - я свяжусь, расскажу детали и отвечу на вопросы.'
                    : 'Оставь контакты - организаторы свяжутся, расскажут детали и ответят на вопросы.'}
              </p>
              <LeadForm tour={p.slug} telegramContact={mainContact} dateOptions={p.dateOptions} />
            </div>
          </div>
        </aside>
      </div>

      <MobileLeadBar price={p.price} priceNote={p.priceNote} label={leadLabel} />
    </div>
  );
}
