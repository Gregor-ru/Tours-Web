import type { Metadata } from 'next';
import { metadata as toursMetadata } from './tours/page';
import { SITE_NAME } from '@/lib/site';

// Главная сразу показывает каталог (без перенаправления на /tours): поисковики, в том числе проверка
// Google Search Console, ищут мета-теги на самой главной странице и плохо переносят редирект.
// Канонический адрес каталога — /tours, поэтому дублем главная не считается.
export { default } from './tours/page';

// Шаблон заголовка из корневого layout на корневую страницу не действует — пишем полный.
export const metadata: Metadata = { ...toursMetadata, title: { absolute: `Все программы — ${SITE_NAME}` } };
