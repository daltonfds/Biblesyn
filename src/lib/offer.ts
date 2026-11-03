export type CountryOffer = {
  currency: string;
  price: number;
  oldPrice: number;
  checkoutUrl: string;
};

// EDIT ONLY THIS BLOCK when you create the country-specific checkout links.
export const OFFERS: Record<string, CountryOffer> = {
  BR: { currency: 'BRL', price: 5.90, oldPrice: 17, checkoutUrl: 'https://checkout.escalepay.com/9630961' },
  US: { currency: 'USD', price: 0, oldPrice: 0, checkoutUrl: 'TODO' }, // TODO: set US price, old price and checkout URL
  PT: { currency: 'EUR', price: 0, oldPrice: 0, checkoutUrl: 'TODO' }, // TODO: set PT price, old price and checkout URL
  IT: { currency: 'EUR', price: 0, oldPrice: 0, checkoutUrl: 'TODO' }, // TODO: set IT price, old price and checkout URL
  ZA: { currency: 'ZAR', price: 0, oldPrice: 0, checkoutUrl: 'TODO' }, // TODO: set ZA price, old price and checkout URL
};

export function getOffer(country?: string | null): CountryOffer {
  const code = (country || 'US').trim().toUpperCase();
  return OFFERS[code] ?? OFFERS.US;
}

export function isCheckoutConfigured(offer: CountryOffer): boolean {
  if (!offer.checkoutUrl.trim() || offer.checkoutUrl.trim().toUpperCase() === 'TODO') return false;
  try { const url = new URL(offer.checkoutUrl); return url.protocol === 'https:'; }
  catch { return false; }
}

export const PRICE = {
  old: new Intl.NumberFormat('pt-BR', {style: 'currency', currency: OFFERS.BR.currency}).format(OFFERS.BR.oldPrice),
  now: new Intl.NumberFormat('pt-BR', {style: 'currency', currency: OFFERS.BR.currency}).format(OFFERS.BR.price),
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
