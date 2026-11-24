import type { PhotoCredit } from '@/lib/programs';

// Подписи к фото со свободной лицензией. CC BY / CC BY-SA требуют автора, лицензию со ссылкой
// и ссылку на источник; CC0 подписи не требует, но указываем для порядка.
// Полный список источников — photo-sources.md в корне репозитория.

const LICENSE_URLS: Record<string, string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/deed.ru',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/deed.ru',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/deed.ru',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/deed.ru',
  'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/deed.ru',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/deed.ru',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/deed.ru',
};

export default function PhotoCredits({ credits }: { credits: PhotoCredit[] }) {
  if (credits.length === 0) return null;
  return (
    <p className="text-xs text-gray-400 leading-relaxed">
      Фото с Wikimedia Commons (размер и формат изменены):{' '}
      {credits.map((c, i) => {
        const lic = LICENSE_URLS[c.license];
        return (
          <span key={c.url}>
            {i > 0 && '; '}
            {c.what} - <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{c.author}</a>,{' '}
            {lic ? <a href={lic} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{c.license}</a> : c.license}
          </span>
        );
      })}
      .
    </p>
  );
}
