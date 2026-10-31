import {cache} from 'react';
import {cookies, headers} from 'next/headers';
import {supabaseServer} from '@/lib/supabase/server';

export const FONTS = ['serif', 'sans', 'classic'] as const;
const SUPPORTED_LOCALES = ['en', 'pt', 'fr', 'es'] as const;
const COUNTRY_LOCALE: Record<string, string> = {
  MZ: 'pt', BR: 'pt', PT: 'pt', AO: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  US: 'en', GB: 'en', IE: 'en', CA: 'en', AU: 'en', NZ: 'en', ZA: 'en',
  FR: 'fr', BE: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', CD: 'fr', CG: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', UY: 'es',
};
function supportedLocale(value?: string | null): string | null {
  const code = value?.trim().toLowerCase().split(/[-_,;]/)[0];
  return code && (SUPPORTED_LOCALES as readonly string[]).includes(code) ? code : null;
}
export const getLanguages = cache(async () => {
  const {data} = await supabaseServer().from('languages').select('code,name,native_name,is_default').eq('active', true).order('sort');
  return (data ?? []) as {code: string; name: string; native_name: string | null; is_default: boolean}[];
});
export const getCountries = cache(async () => {
  const {data} = await supabaseServer().from('countries').select('code,name,default_locale').eq('active', true).order('name');
  return (data ?? []) as {code: string; name: string; default_locale: string | null}[];
});
export const getLocale = cache(async (): Promise<string> => {
  const langs = await getLanguages();
  const available = new Set(langs.map(l => l.code.toLowerCase()));
  const saved = supportedLocale(cookies().get('locale')?.value);
  if (saved && available.has(saved)) return saved;

  const country = (cookies().get('country')?.value || headers().get('x-vercel-ip-country') || '').toUpperCase();
  const countryLocale = supportedLocale(COUNTRY_LOCALE[country]);
  if (countryLocale && available.has(countryLocale)) return countryLocale;

  const browserLocale = supportedLocale(headers().get('accept-language')?.split(',')[0]);
  if (browserLocale && available.has(browserLocale)) return browserLocale;
  return langs.find(l => l.is_default)?.code ?? langs[0]?.code ?? 'en';
});
export function getCountry(): string {
  return (cookies().get('country')?.value || headers().get('x-vercel-ip-country') || '').toUpperCase();
}
export function getReaderPrefs(): {f: string; s: number} {
  try { const j = JSON.parse(cookies().get('reader')?.value ?? '{}'); return {f: (FONTS as readonly string[]).includes(j.f) ? j.f : 'serif', s: Math.min(28, Math.max(15, Number(j.s) || 19))}; }
  catch { return {f: 'serif', s: 19}; }
}
