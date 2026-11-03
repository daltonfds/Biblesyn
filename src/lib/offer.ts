export type CountryOffer = {
  currency: string;
  price: number;
  oldPrice: number;
  checkoutUrl: string;
};

// EDIT ONLY THIS BLOCK when creating or changing country checkout links.
export const OFFERS: Record<string, CountryOffer> = {
  BR: { currency: 'BRL', price: 5.90, oldPrice: 17.00, checkoutUrl: 'https://checkout.escalepay.com/9630961' },
  US: { currency: 'USD', price: 1.00, oldPrice: 5.00, checkoutUrl: 'https://checkout.escalepay.com/4998831' },
  ZA: { currency: 'ZAR', price: 17.00, oldPrice: 80.00, checkoutUrl: 'https://checkout.escalepay.com/9787366' },
  PT: { currency: 'EUR', price: 1.00, oldPrice: 5.00, checkoutUrl: 'https://checkout.escalepay.com/3788940' },
  IT: { currency: 'EUR', price: 1.00, oldPrice: 5.00, checkoutUrl: 'TODO' }, // TODO: create the Italy checkout link
};

export function resolveOfferCountry(country?: string | null): string {
  const code = (country || 'US').trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(OFFERS, code) ? code : 'US';
}

export function getOffer(country?: string | null): CountryOffer {
  return OFFERS[resolveOfferCountry(country)];
}

export function getOfferByCheckoutId(checkoutId?: string | number | null): {country: string; offer: CountryOffer} | null {
  const id = String(checkoutId ?? '').trim();
  if (!id) return null;
  for (const [country, offer] of Object.entries(OFFERS)) {
    if (!isCheckoutConfigured(offer)) continue;
    try {
      if (new URL(offer.checkoutUrl).pathname.split('/').filter(Boolean).pop() === id) {
        return {country, offer};
      }
    } catch { /* Invalid URLs are treated as unconfigured. */ }
  }
  return null;
}

export function getDiscountPercent(offer: CountryOffer): number {
  return offer.oldPrice > offer.price ? Math.round((1 - offer.price / offer.oldPrice) * 100) : 0;
}

export function isCheckoutConfigured(offer: CountryOffer): boolean {
  if (!offer.checkoutUrl.trim() || offer.checkoutUrl.trim().toUpperCase() === 'TODO') return false;
  try { const url = new URL(offer.checkoutUrl); return url.protocol === 'https:'; }
  catch { return false; }
}

// Legacy Brazil-only landing page display values.
export const PRICE = {
  old: new Intl.NumberFormat('pt-BR', {style: 'currency', currency: OFFERS.BR.currency}).format(OFFERS.BR.oldPrice),
  now: new Intl.NumberFormat('pt-BR', {style: 'currency', currency: OFFERS.BR.currency}).format(OFFERS.BR.price),
  discount: getDiscountPercent(OFFERS.BR),
  total: 'R$ 97,00',
};
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
