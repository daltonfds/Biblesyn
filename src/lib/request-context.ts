
const SUPPORTED_LOCALES = ['en', 'en-ZA', 'pt-BR', 'pt-PT', 'fr', 'es', 'it'] as const;

const COUNTRY_LOCALE: Record<string, string> = {
  BR: 'pt-BR', PT: 'pt-PT', AO: 'pt-PT', MZ: 'pt-PT', CV: 'pt-PT',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it', SM: 'it', VA: 'it', ZA: 'en-ZA',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
};

export function acceptLanguageLocale(header: string | null | undefined): string | null {
  if (!header) return null;
  const candidates = header.split(',').map((part, index) => {
    const [tag, ...params] = part.trim().split(';');
    const q = Number(params.find(p => p.trim().startsWith('q='))?.trim().slice(2) ?? 1);
    return {tag: tag.replace('_', '-').toLowerCase(), q, index};
  }).filter(x => x.q > 0).sort((a, b) => b.q - a.q || a.index - b.index);
  for (const candidate of candidates) {
    const exact = SUPPORTED_LOCALES.find(locale => locale.toLowerCase() === candidate.tag);
    if (exact) return exact;
    const language = candidate.tag.split('-')[0];
    if (language === 'en') return 'en';
    const regional = SUPPORTED_LOCALES.find(locale => locale.toLowerCase().startsWith(language + '-'));
    if (regional) return regional;
    if ((SUPPORTED_LOCALES as readonly string[]).includes(language)) return language;
  }
  return null;
}

export function resolveRequestContext(input: {
  ipCountry?: string | null;
  manualLocale?: string | null;
  acceptLanguage?: string | null;
  overrideCountry?: string | null;
  cookieCountry?: string | null;
  environment?: string | null;
}) {
  const production = input.environment === 'production';
  const valid = (value?: string | null) => {
    const code = (value || '').trim().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  };
  const country = production
    ? valid(input.ipCountry)
    : valid(input.overrideCountry) || valid(input.cookieCountry) || valid(input.ipCountry);
  const manual = (input.manualLocale || '').trim();
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(manual)
    ? manual
    : (country && COUNTRY_LOCALE[country]) || acceptLanguageLocale(input.acceptLanguage) || 'en';
  const offerCountry = country && ['BR', 'PT', 'IT', 'ZA', 'US'].includes(country) ? country : 'US';
  return {country, offerCountry, locale};
}
