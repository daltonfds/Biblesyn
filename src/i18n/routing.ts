import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'en-ZA', 'pt-BR', 'pt-PT', 'fr', 'es', 'it'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  },
});

export type AppLocale = (typeof routing.locales)[number];
