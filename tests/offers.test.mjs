import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const module = {exports: {}};
vm.runInNewContext(js, {module, exports: module.exports, URL});
const {getOffer, isCheckoutConfigured, OFFERS} = module.exports;

for (const country of ['US','PT','IT','ZA','BR']) {
  test(country + ' resolves to its own offer and checkout URL', () => {
    assert.equal(getOffer(country), OFFERS[country]);
    assert.equal(getOffer(country).currency, OFFERS[country].currency);
    assert.equal(getOffer(country).checkoutUrl, OFFERS[country].checkoutUrl);
  });
}
test('unmapped country falls back to US offer', () => {
  assert.equal(getOffer('MZ'), OFFERS.US);
  assert.equal(getOffer('XX'), OFFERS.US);
});

test('TODO and empty checkout links are disabled', () => {
  assert.equal(isCheckoutConfigured(OFFERS.US), false);
  assert.equal(isCheckoutConfigured(OFFERS.PT), false);
  assert.equal(isCheckoutConfigured(OFFERS.BR), true);
  assert.equal(isCheckoutConfigured({currency: 'USD', price: 10, oldPrice: 20, checkoutUrl: ''}), false);
});
