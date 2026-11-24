import type { Organizer, OrganizerId } from '@/lib/programs';

// FACTS п. 6–8, 55, 57
export const ORGANIZERS: Record<OrganizerId, Organizer> = {
  eg: {
    id: 'eg',
    org: 'Авторские туры от Егора Гребёнкина',
    person: 'Егор Гребёнкин',
    logo: '/logo.jpg',
    link: null,
    contact: '@gregor_travel_ru',
  },
  severny: {
    id: 'severny',
    org: 'Спортивный комплекс «Северный», Киров',
    person: 'Максим Слотин',
    logo: '/images/logos/severny.jpg',
    link: 'https://vk.com/sk.severnyy',
    contact: '@gregor_travel_ru', // ❓ отдельный контакт Максима — пока заявки идут через общий Telegram
  },
};
