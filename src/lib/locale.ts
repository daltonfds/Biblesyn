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
const LOCALE_OPTIONS = [
  {code: 'en', name: 'English', native_name: 'English', is_default: true},
  {code: 'en-ZA', name: 'English (South Africa)', native_name: 'English (South Africa)', is_default: false},
  {code: 'pt-BR', name: 'Portuguese (Brazil)', native_name: 'Português (Brasil)', is_default: false},
  {code: 'pt-PT', name: 'Portuguese (Portugal)', native_name: 'Português (Portugal)', is_default: false},
  {code: 'fr', name: 'French', native_name: 'Français', is_default: false},
  {code: 'es', name: 'Spanish', native_name: 'Español', is_default: false},
  {code: 'it', name: 'Italian', native_name: 'Italiano', is_default: false},
] as const;

export const getLanguages = cache(async () => {
  const {data} = await supabaseServer().from('languages').select('code,name,native_name,is_default').eq('active', true).order('sort');
  const stored = new Map((data ?? []).map((row: any) => [row.code, row]));
  return LOCALE_OPTIONS.map(option => ({...option, ...(stored.get(option.code) ?? {})}));
});
export const getCountries = cache(async () => {
  const {data} = await supabaseServer().from('countries').select('code,name,default_locale').eq('active', true).order('name');
  const fallback = [
    ['BR','Brazil','pt-BR'],['PT','Portugal','pt-PT'],['AO','Angola','pt-PT'],['MZ','Mozambique','pt-PT'],['CV','Cape Verde','pt-PT'],
    ['FR','France','fr'],['BE','Belgium','fr'],['CH','Switzerland','fr'],['LU','Luxembourg','fr'],
    ['ES','Spain','es'],['MX','Mexico','es'],['AR','Argentina','es'],['CO','Colombia','es'],['CL','Chile','es'],['PE','Peru','es'],
    ['IT','Italy','it'],['SM','San Marino','it'],['VA','Vatican City','it'],
    ['ZA','South Africa','en-ZA'],['US','United States','en'],['GB','United Kingdom','en'],['CA','Canada','en'],['AU','Australia','en'],
  ];
  const stored = new Map((data ?? []).map((row: any) => [row.code, row]));
  const merged = new Map<string, {code: string; name: string; default_locale: string | null}>();
  for (const [code,name,default_locale] of fallback) merged.set(code, {code,name,default_locale});
  for (const row of data ?? []) merged.set(row.code, row);
  return [...merged.values()].sort((a,b) => a.name.localeCompare(b.name));
});
export const getLocale = cache(async (): Promise<string> => {
  const manual = supportedLocale(cookies().get('NEXT_LOCALE')?.value || cookies().get('locale')?.value);
  if (manual) return manual;

  const country = (getCountryCookie() || process.env.NEXT_COUNTRY || headers().get('x-vercel-ip-country') || '').toUpperCase();
  const countryLocale = supportedLocale(COUNTRY_LOCALE[country]);
  if (countryLocale) return countryLocale;

  const browser = headers().get('accept-language')?.split(',')[0]?.split(';')[0];
  return supportedLocale(browser) || 'en';
});

export function getCountryCookie(): string {
  return (cookies().get('NEXT_COUNTRY')?.value || cookies().get('country')?.value || '').trim().toUpperCase();
}

export function getCountry(): string {
  return getCountryCookie() || (process.env.NEXT_COUNTRY || headers().get('x-vercel-ip-country') || '').trim().toUpperCase();
}

export function getReaderPrefs(): {f: string; s: number} {
  try { const j = JSON.parse(cookies().get('reader')?.value ?? '{}'); return {f: (FONTS as readonly string[]).includes(j.f) ? j.f : 'serif', s: Math.min(28, Math.max(15, Number(j.s) || 19))}; }
  catch { return {f: 'serif', s: 19}; }
}

export function getContentLocale(locale: string): string {
  return locale === 'en-ZA' ? 'en' : locale;
}
