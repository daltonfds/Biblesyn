import {cache} from 'react';
import {cookies, headers} from 'next/headers';
import {supabaseServer} from '@/lib/supabase/server';

export const FONTS = ['serif', 'sans', 'classic'] as const;
const SUPPORTED_LOCALES = ['en', 'en-ZA', 'pt-BR', 'pt-PT', 'fr', 'es', 'it'] as const;
const COUNTRY_LOCALE: Record<string, string> = {
  BR: 'pt-BR', PT: 'pt-PT', AO: 'pt-PT', MZ: 'pt-PT', CV: 'pt-PT',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it', SM: 'it', VA: 'it', ZA: 'en-ZA',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
};
function supportedLocale(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().replace('_', '-');
  if (normalized === 'pt') return 'pt-BR';
  return (SUPPORTED_LOCALES as readonly string[]).find(code => code.toLowerCase() === normalized.toLowerCase()) ?? null;
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
  const manual = supportedLocale(cookies().get('NEXT_LOCALE')?.value || cookies().get('locale')?.value);
  if (manual) return manual;

  const country = (headers().get('x-vercel-ip-country') || cookies().get('country')?.value || '').toUpperCase();
  const countryLocale = supportedLocale(COUNTRY_LOCALE[country]);
  if (countryLocale) return countryLocale;

  const browser = headers().get('accept-language')?.split(',')[0]?.split(';')[0];
  return supportedLocale(browser) || 'en';
});
export function getCountry(): string {
  return (cookies().get('country')?.value || headers().get('x-vercel-ip-country') || '').toUpperCase();
}
export function getReaderPrefs(): {f: string; s: number} {
  try { const j = JSON.parse(cookies().get('reader')?.value ?? '{}'); return {f: (FONTS as readonly string[]).includes(j.f) ? j.f : 'serif', s: Math.min(28, Math.max(15, Number(j.s) || 19))}; }
  catch { return {f: 'serif', s: 19}; }
}
