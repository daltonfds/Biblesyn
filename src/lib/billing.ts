import {supabaseServer} from '@/lib/supabase/server';

const BILLING: Record<string, {currency: string; fallbackCountry: string}> = {
  en: {currency: 'USD', fallbackCountry: 'US'},
  'en-ZA': {currency: 'ZAR', fallbackCountry: 'ZA'},
  'pt-PT': {currency: 'EUR', fallbackCountry: 'PT'},
  fr: {currency: 'EUR', fallbackCountry: 'FR'},
  es: {currency: 'EUR', fallbackCountry: 'ES'},
  it: {currency: 'EUR', fallbackCountry: 'IT'},
};
export type BillingPrice = {currency: string; amountCents: number; country: string; formatted: string};

export async function getBillingPrice(locale: string, country?: string): Promise<BillingPrice | null> {
  if (locale === 'pt-BR') {
    if (country?.toUpperCase() !== 'BR') return null;
    return {currency: 'BRL', amountCents: 590, country: 'BR', formatted: 'R$ 5,90'};
  }
  const config = BILLING[locale];
  if (!config) return null;
  const db = supabaseServer();
  const requestedCountry = country?.toUpperCase();
  let row: {currency: string; amount_cents: number} | null = null;
  if (requestedCountry) {
    const result = await db.from('prices').select('currency,amount_cents')
      .eq('country', requestedCountry).eq('active', true).maybeSingle();
    row = result.data;
  }
  if (!row || row.currency !== config.currency) {
    const result = await db.from('prices').select('currency,amount_cents')
      .eq('country', config.fallbackCountry).eq('active', true).maybeSingle();
    row = result.data;
  }
  if (!row || row.currency !== config.currency || !Number.isFinite(row.amount_cents) || row.amount_cents <= 0) return null;
  return {
    currency: row.currency, amountCents: row.amount_cents,
    country: requestedCountry || config.fallbackCountry,
    formatted: new Intl.NumberFormat(locale, {style: 'currency', currency: row.currency}).format(row.amount_cents / 100),
  };
}
