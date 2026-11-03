import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const module = {exports: {}};
vm.runInNewContext(js, {module, exports: module.exports, URL});
const {getOffer, getOfferByCheckoutId, getDiscountPercent, isCheckoutConfigured, resolveOfferCountry, resolveWebhookOffer, OFFERS} = module.exports;

const expected = {
  BR: {currency: 'BRL', price: 5.90, oldPrice: 17.00, id: '9630961'},
  US: {currency: 'USD', price: 1.00, oldPrice: 5.00, id: '4998831'},
  ZA: {currency: 'ZAR', price: 17.00, oldPrice: 80.00, id: '9787366'},
  PT: {currency: 'EUR', price: 1.00, oldPrice: 5.00, id: '3788940'},
  IT: {currency: 'EUR', price: 1.00, oldPrice: 5.00, id: '3788940'},
};
for (const [country, value] of Object.entries(expected)) {
  test(country + ' resolves to the correct EscalePay offer', () => {
    const offer = getOffer(country);
    assert.equal(offer.currency, value.currency);
    assert.equal(offer.price, value.price);
    assert.equal(offer.oldPrice, value.oldPrice);
    assert.equal(getDiscountPercent(offer), Math.round((1 - value.price / value.oldPrice) * 100));
    assert.equal(offer.checkoutUrl, 'https://checkout.escalepay.com/' + value.id);
    assert.equal(isCheckoutConfigured(offer), true);
  });
}
test('unmapped country falls back to the US offer', () => {
  assert.equal(resolveOfferCountry('MZ'), 'US');
  assert.equal(getOffer('MZ'), OFFERS.US);
  assert.equal(getOffer('XX'), OFFERS.US);
});
test('checkout IDs resolve to a configured offer', () => {
  for (const id of ['9630961', '4998831', '9787366', '3788940']) {
    const found = getOfferByCheckoutId(id);
    assert.ok(found);
    assert.equal(found.offer.currency, id === '9630961' ? 'BRL' : id === '4998831' ? 'USD' : id === '9787366' ? 'ZAR' : 'EUR');
  }
  assert.equal(getOfferByCheckoutId('not-a-checkout'), null);
});
test('empty checkout links remain disabled', () => {
  assert.equal(isCheckoutConfigured(OFFERS.IT), true);
  assert.equal(isCheckoutConfigured({...OFFERS.IT, checkoutUrl: ''}), false);
});
test('shared PT/IT checkout resolves country from payment, then profile, then PT', () => {
  const id = '3788940';
  assert.equal(resolveWebhookOffer(id, 'IT', 'PT').country, 'IT');
  assert.equal(resolveWebhookOffer(id, 'PT', 'IT').country, 'PT');
  assert.equal(resolveWebhookOffer(id, '', 'IT').country, 'IT');
  assert.equal(resolveWebhookOffer(id, '', '').country, 'PT');
  assert.equal(resolveWebhookOffer(id, 'IT', '').offer.currency, 'EUR');
  assert.equal(resolveWebhookOffer('9630961', 'IT', 'BR').country, 'BR');
  assert.equal(resolveWebhookOffer('unknown', 'IT', 'IT'), null);
});
