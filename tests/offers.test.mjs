import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const js = ts.transpile(source, {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020});
const sandbox = {module: {exports: {}}, exports: {}};
vm.runInNewContext(js, sandbox);
const {getOffer, OFFERS} = sandbox.module.exports;

for (const country of ['US','PT','IT','ZA','BR']) {
  test(country + ' resolves to its own offer', () => {
    assert.equal(getOffer(country), OFFERS[country]);
    assert.equal(getOffer(country).currency, OFFERS[country].currency);
    assert.equal(getOffer(country).checkoutUrl, OFFERS[country].checkoutUrl);
  });
}
test('unmapped country falls back to US offer', () => {
  assert.equal(getOffer('MZ'), OFFERS.US);
  assert.equal(getOffer('XX'), OFFERS.US);
});
