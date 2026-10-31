import {cache} from 'react';
import {supabaseServer} from '@/lib/supabase/server';
import {DEFAULTS} from './i18n-defaults';
import {getLocale} from './locale';
export const fmt = (s: string, v?: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v?.[k] ?? ''));
export const getStrings = cache(async (locale: string) => {
  const {data} = await supabaseServer().from('ui_strings').select('key,value').eq('locale', locale);
  const o: Record<string, string> = {...DEFAULTS};
  (data ?? []).forEach((r: any) => { if (r.value) o[r.key] = r.value; });
  return o;
});
export async function getT() {
  const s = await getStrings(await getLocale());
  return (k: string, v?: Record<string, string | number>) => fmt(s[k] ?? DEFAULTS[k] ?? k, v);
}
