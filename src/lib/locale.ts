import {cache} from 'react';
import {cookies, headers} from 'next/headers';
import {supabaseServer} from '@/lib/supabase/server';
export const FONTS = ['serif', 'sans', 'classic'] as const;
export const getLanguages = cache(async () => {
  const {data} = await supabaseServer().from('languages').select('code,name,native_name,is_default').eq('active', true).order('sort');
  return (data ?? []) as {code: string; name: string; native_name: string | null; is_default: boolean}[];
});
export const getCountries = cache(async () => {
  const {data} = await supabaseServer().from('countries').select('code,name,default_locale').eq('active', true).order('name');
  return (data ?? []) as {code: string; name: string; default_locale: string | null}[];
});
export const getLocale = cache(async (): Promise<string> => {
  const langs = await getLanguages(); const c = cookies().get('locale')?.value;
  if (c && langs.some(l => l.code === c)) return c;
  return langs.find(l => l.is_default)?.code ?? langs[0]?.code ?? 'en';
});
export function getCountry(): string {
  return (cookies().get('country')?.value || headers().get('x-vercel-ip-country') || '').toUpperCase();
}
export function getReaderPrefs(): {f: string; s: number} {
  try { const j = JSON.parse(cookies().get('reader')?.value ?? '{}'); return {f: (FONTS as readonly string[]).includes(j.f) ? j.f : 'serif', s: Math.min(28, Math.max(15, Number(j.s) || 19))}; }
  catch { return {f: 'serif', s: 19}; }
}
