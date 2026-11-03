import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const module = {exports: {}};
vm.runInNewContext(js, {module, exports: module.exports, URL});
const {getOffer, getOfferByCheckoutId, isCheckoutConfigured, resolveOfferCountry, OFFERS} = module.exports;

const expected = {
  BR: {currency: 'BRL', price: 5.90, oldPrice: 17.00, id: '9630961'},
  US: {currency: 'USD', price: 1.00, oldPrice: 5.00, id: '4998831'},
  ZA: {currency: 'ZAR', price: 17.00, oldPrice: 80.00, id: '9787366'},
  PT: {currency: 'EUR', price: 1.00, oldPrice: 5.00, id: '3788940'},
  IT: {currency: 'EUR', price: 1.00, oldPrice: 5.00, id: null},
};
for (const [country, value] of Object.entries(expected)) {
  test(country + ' resolves to the correct EscalePay offer', () => {
    const offer = getOffer(country);
    assert.equal(offer.currency, value.currency);
    assert.equal(offer.price, value.price);
    assert.equal(offer.oldPrice, value.oldPrice);
    assert.equal(offer.checkoutUrl, value.id ? 'https://checkout.escalepay.com/' + value.id : 'TODO');
    assert.equal(isCheckoutConfigured(offer), Boolean(value.id));
  });
}
test('unmapped country falls back to the US offer', () => {
  assert.equal(resolveOfferCountry('MZ'), 'US');
  assert.equal(getOffer('MZ'), OFFERS.US);
  assert.equal(getOffer('XX'), OFFERS.US);
});
test('checkout IDs resolve to the correct country and currency', () => {
  for (const [country, value] of Object.entries(expected)) {
    if (!value.id) continue;
    const found = getOfferByCheckoutId(value.id);
    assert.equal(found.country, country);
    assert.equal(found.offer.currency, value.currency);
  }
  assert.equal(getOfferByCheckoutId('not-a-checkout'), null);
});
test('TODO and empty checkout links are disabled', () => {
  assert.equal(isCheckoutConfigured(OFFERS.IT), false);
  assert.equal(isCheckoutConfigured({...OFFERS.IT, checkoutUrl: ''}), false);
});
