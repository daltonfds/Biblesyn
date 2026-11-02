import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import en from '../../messages/en.json';
import enZA from '../../messages/en-ZA.json';
import ptBR from '../../messages/pt-BR.json';
import ptPT from '../../messages/pt-PT.json';
import fr from '../../messages/fr.json';
import es from '../../messages/es.json';
import it from '../../messages/it.json';

const catalogs = {
  en, 'en-ZA': {...en, ...enZA}, 'pt-BR': ptBR, 'pt-PT': ptPT, fr, es, it,
};

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {locale, messages: catalogs[locale]};
});
