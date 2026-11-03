import {cache} from 'react';
import {getTranslations} from 'next-intl/server';
import {supabaseServer} from '@/lib/supabase/server';
import {DEFAULTS} from './i18n-defaults';
import en from '../../messages/en.json';
import enZA from '../../messages/en-ZA.json';
import ptBR from '../../messages/pt-BR.json';
import ptPT from '../../messages/pt-PT.json';
import fr from '../../messages/fr.json';
import es from '../../messages/es.json';
import it from '../../messages/it.json';

interface MessageTree { [key: string]: string | MessageTree; }
function isTree(value: unknown): value is MessageTree {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function deepMerge(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = {...base};
  for (const [key, value] of Object.entries(override)) {
    result[key] = isTree(value) && isTree(result[key]) ? deepMerge(result[key] as MessageTree, value) : value;
  }
  return result;
}
export function flattenMessages(tree: MessageTree, prefix = '', out: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? prefix + '.' + key : key;
    if (typeof value === 'string') out[path] = value;
    else flattenMessages(value, path, out);
  }
  return out;
}
export function nestMessages(flat: Record<string, string>): MessageTree {
  const result: MessageTree = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.');
    let current = result;
    for (const part of parts.slice(0, -1)) {
      if (!isTree(current[part])) current[part] = {};
      current = current[part] as MessageTree;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

const CATALOGS: Record<string, MessageTree> = {
  en,
  'en-ZA': deepMerge(en, enZA),
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  fr,
  es,
  it,
};

export const fmt = (s: string, values?: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, key) => String(values?.[key] ?? ''));

export const getStrings = cache(async (locale: string) => {
  const messages = CATALOGS[locale] || en;
  const strings: Record<string, string> = {...DEFAULTS, ...flattenMessages(messages)};
  const {data} = await supabaseServer().from('ui_strings').select('key,value').eq('locale', locale);
  (data ?? []).forEach((row: any) => { if (row.value) strings[row.key] = row.value; });
  return strings;
});

export async function getT() {
  const translate = await getTranslations();
  return (key: string, values?: Record<string, string | number>) =>
    translate(key as never, values as never);
}
