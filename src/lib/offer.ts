import {supabaseServer} from '@/lib/supabase/server';

export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL ?? 'https://checkout.escalepay.com/9630961';

export const PRICE = {old: 'R$ 17', now: 'R$ 5,90', total: 'R$ 97'};

export const BONUSES = [
  {t: 'Manual de Interpretação Bíblica', d: 'Interprete corretamente, evite erros comuns e aplique a hermenêutica de forma simples.'},
  {t: 'Devocionais de Poder: 30 dias', d: 'Reflexões, versículos-chave e orações para fortalecer sua conexão com Deus.'},
  {t: 'Os 10 Mandamentos', d: 'Origem, significado profundo e como aplicar na vida moderna.'},
  {t: 'Os Milagres de Jesus', d: 'Cada milagre com contexto bíblico, reflexão e lição espiritual.'},
  {t: 'Histórias Bíblicas para a Família', d: 'As histórias mais poderosas, para ensinar crianças e adultos em casa ou na igreja.'},
  {t: 'Oração Profética', d: 'Orações para quebrar maldições, declarar vitórias e ativar a unção.'},
  {t: 'Guia de Jejum Espiritual', d: 'Passo a passo completo para jejuns que aprofundam a intimidade com Deus.'},
  {t: 'Segredos da Oração', d: 'Técnicas bíblicas de oração que movem montanhas e abrem portas.'},
];

export const TEASERS = [
  {q: 'Por que os escolhidos de Deus sofrem tanto?', a: 'Quem tem chamado incomoda o inimigo. Ataque espiritual não é abandono; muitas vezes é sinal de alvo. “Sede sóbrios e vigilantes.” (1 Pedro 5:8)'},
  {q: 'E se eu não conseguir parar de pecar?', a: 'A sua queda não encerra a sua história. “O justo cai sete vezes e se levanta.” (Provérbios 24:16) Confesse, levante-se e recomece.'},
  {q: 'Faça isto quando for tentado', a: 'Saia do ambiente, ore em voz alta, abra a Palavra e fale com alguém de confiança. “Resisti ao diabo, e ele fugirá de vós.” (Tiago 4:7)'},
  {q: '5 batalhas que todo cristão enfrenta', a: 'Mente, tentação, finanças, relacionamentos e constância na oração. Nomear a batalha é o primeiro passo para vencê-la com a Palavra.'},
];

export const FAQ = [
  {q: 'Como recebo o acesso?', a: 'Logo após a confirmação do pagamento você recebe as instruções de acesso.'},
  {q: 'Funciona no celular?', a: 'Sim, foi pensado para o celular e também funciona no computador.'},
  {q: 'Está em português?', a: 'Sim, o conteúdo desta oferta está em português.'},
  {q: 'Preciso ter conhecimento bíblico?', a: 'Não. Há caminhos para iniciantes e para quem já estuda a Palavra.'},
];

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
    currency: row.currency,
    amountCents: row.amount_cents,
    country: requestedCountry || config.fallbackCountry,
    formatted: new Intl.NumberFormat(locale, {style: 'currency', currency: row.currency}).format(row.amount_cents / 100),
  };
}
