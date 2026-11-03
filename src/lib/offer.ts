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
  return Boolean(offer.checkoutUrl.trim()) && offer.checkoutUrl.trim().toUpperCase() !== 'TODO';
}
