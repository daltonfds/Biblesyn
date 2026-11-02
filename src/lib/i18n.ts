import {cache} from 'react';
import {supabaseServer} from '@/lib/supabase/server';
import {DEFAULTS} from './i18n-defaults';
import en from '../../messages/en.json';
import enZA from '../../messages/en-ZA.json';
import ptBR from '../../messages/pt-BR.json';
import ptPT from '../../messages/pt-PT.json';
import fr from '../../messages/fr.json';
import es from '../../messages/es.json';
import it from '../../messages/it.json';

const CATALOGS: Record<string, Record<string, string>> = {
  en, 'en-ZA': {...en, ...enZA}, 'pt-BR': ptBR, 'pt-PT': ptPT, fr, es, it,
};
export const fmt = (s: string, v?: Record<string, string | number>) =>
  s.replace(/\\{(\\w+)\\}/g, (_, k) => String(v?.[k] ?? ''));

export const getStrings = cache(async (locale: string) => {
  const o: Record<string, string> = {...DEFAULTS, ...(CATALOGS[locale] || en)};
  const {data} = await supabaseServer().from('ui_strings').select('key,value').eq('locale', locale);
  (data ?? []).forEach((r: any) => { if (r.value) o[r.key] = r.value; });
  return o;
});
export async function getT() {
  const {getLocale} = await import('./locale');
  const s = await getStrings(await getLocale());
  return (k: string, v?: Record<string, string | number>) => fmt(s[k] ?? DEFAULTS[k] ?? k, v);
}
