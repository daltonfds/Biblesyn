import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const module = {exports: {}};
vm.runInNewContext(js, {module, exports: module.exports, URL});
const {getOfferPresentation, buildOfferCheckoutUrl} = module.exports;

const readMessages = locale => JSON.parse(fs.readFileSync(new URL('../messages/' + locale + '.json', import.meta.url), 'utf8'));
const merge = (base, override) => {
  const result = {...base};
  for (const [key, value] of Object.entries(override)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? merge(result[key] || {}, value)
      : value;
  }
  return result;
};
const messagesFor = locale => locale === 'en-ZA'
  ? merge(readMessages('en'), readMessages('en-ZA'))
  : readMessages(locale);
const clean = value => value.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();

const cases = [
  {locale:'pt-BR',country:'BR',current:'R$ 5,90',old:'R$ 17,00',discount:65,id:'9630961',cta:'Assinar'},
  {locale:'pt-PT',country:'PT',current:'1,00 €',old:'5,00 €',discount:80,id:'3788940',cta:'Subscrever'},
  {locale:'it',country:'IT',current:'1,00 €',old:'5,00 €',discount:80,id:'3788940',cta:'Abbonati'},
  {locale:'en-ZA',country:'ZA',current:'R 17,00',old:'R 80,00',discount:79,id:'9787366',cta:'Subscribe'},
  {locale:'en',country:'US',current:'US$1.00',old:'US$5.00',discount:80,id:'4998831',cta:'Subscribe'},
  {locale:'pt-PT',country:'US',current:'1,00 US$',old:'5,00 US$',discount:80,id:'4998831',cta:'Subscrever'},
  {locale:'pt-BR',country:'PT',current:'€ 1,00',old:'€ 5,00',discount:80,id:'3788940',cta:'Assinar'},
  {locale:'it',country:'US',current:'1,00 USD',old:'5,00 USD',discount:80,id:'4998831',cta:'Abbonati'},
  {locale:'en',country:'XX',current:'US$1.00',old:'US$5.00',discount:80,id:'4998831',cta:'Subscribe'},
];

for (const item of cases) {
  test('localized offer render model: ' + item.locale + ' / ' + item.country, () => {
    const view = getOfferPresentation(item.locale, item.country);
    assert.equal(view.country, item.country === 'XX' ? 'US' : item.country);
    assert.equal(clean(view.formattedPrice), item.current);
    assert.equal(clean(view.formattedOldPrice), item.old);
    assert.equal(view.discountPercent, item.discount);
    const checkout = new URL(buildOfferCheckoutUrl(item.locale, item.country, 'user-123', 'buyer@example.com'));
    assert.equal(checkout.pathname.split('/').pop(), item.id);
    assert.equal(checkout.searchParams.get('locale'), item.locale);
    assert.equal(checkout.searchParams.get('country'), item.country === 'XX' ? 'US' : item.country);
    assert.equal(checkout.searchParams.get('user_id'), 'user-123');
    assert.equal(checkout.searchParams.get('email'), 'buyer@example.com');
    const messages = messagesFor(item.locale);
    const cta = messages.premium.subscribe.replace('{price}', view.formattedPrice);
    assert.ok(cta.startsWith(item.cta), cta);
    const discount = messages.premium.discount.replace('{percent}', String(view.discountPercent));
    assert.match(discount, new RegExp(String(item.discount)));
  });
}

test('locale and country cookies survive middleware, auth, preference sync and checkout', () => {
  const middleware = fs.readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
  const callback = fs.readFileSync(new URL('../src/app/[locale]/(auth)/auth/callback/route.ts', import.meta.url), 'utf8');
  const auth = fs.readFileSync(new URL('../src/components/AuthForm.tsx', import.meta.url), 'utf8');
  const prefs = fs.readFileSync(new URL('../src/app/api/prefs/route.ts', import.meta.url), 'utf8');
  const checkout = fs.readFileSync(new URL('../src/app/api/checkout/route.ts', import.meta.url), 'utf8');
  for (const source of [middleware, callback, auth, prefs]) {
    assert.match(source, /NEXT_LOCALE/);
    assert.match(source, /NEXT_COUNTRY/);
  }
  assert.match(middleware, /req\.headers\.get\('x-vercel-ip-country'\)/);
  assert.match(middleware, /manualLocale: req\.cookies\.get\('NEXT_LOCALE'\)/);
  assert.match(callback, /countryCookie = cookieStore\.get\('NEXT_COUNTRY'\)/);
  assert.match(auth, /post\(\{sync: true, locale\}\)/);
  assert.match(prefs, /x-vercel-ip-country/);
  assert.match(checkout, /getCountryCookie\(\) \|\| getCountry\(\) \|\| 'US'/);
  assert.match(checkout, /buildOfferCheckoutUrl\(locale, country, user\.id, customerEmail\)/);
  assert.doesNotMatch(checkout, /profile\?\.country/);
});

test('sale prices and EscalePay URLs have one source of truth', () => {
  const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
  const files = [...walk(new URL('../src', import.meta.url).pathname), ...walk(new URL('../messages', import.meta.url).pathname)];
  const currencyLiteral = /R\$\s*\d|US\$\s*\d|€\s*\d|\d[,.]\d{2}\s*€|R\s*\d+[,.]\d{2}/;
  const checkoutLiteral = /https:\/\/checkout\.escalepay\.com\//;
  const violations = [];
  for (const file of files) {
    if (file.endsWith(path.join('lib', 'offer.ts'))) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (currencyLiteral.test(text) || checkoutLiteral.test(text)) violations.push(path.relative(new URL('../', import.meta.url).pathname, file));
  }
  assert.deepEqual(violations, []);
});


test('all localized offer pages and checkout responses are dynamic and private', () => {
  const layout = fs.readFileSync(new URL('../src/app/[locale]/layout.tsx', import.meta.url), 'utf8');
  const premium = fs.readFileSync(new URL('../src/app/[locale]/(app)/premium/page.tsx', import.meta.url), 'utf8');
  const privateOffer = fs.readFileSync(new URL('../src/app/[locale]/(marketing)/oferta-privada/page.tsx', import.meta.url), 'utf8');
  const middleware = fs.readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
  const checkout = fs.readFileSync(new URL('../src/app/api/checkout/route.ts', import.meta.url), 'utf8');
  for (const source of [layout, premium, privateOffer, checkout]) assert.match(source, /dynamic = ['"]force-dynamic['"]/);
  for (const source of [middleware, checkout]) {
    assert.match(source, /Cache-Control/);
    assert.match(source, /private, no-store/);
    assert.match(source, /Vary/);
    assert.match(source, /x-vercel-ip-country/);
    assert.match(source, /Accept-Language/);
  }
});
