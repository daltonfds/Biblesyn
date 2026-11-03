import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/request-context.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
const module = {exports: {}};
vm.runInNewContext(js, {module, exports: module.exports});
const {resolveRequestContext} = module.exports;

const countries = [
  ['BR','pt-BR'], ['PT','pt-PT'], ['IT','it'], ['ZA','en-ZA'], ['US','en'],
];
for (const [country, locale] of countries) {
  test('IP country ' + country + ' determines locale and offer country', () => {
    assert.deepEqual(
      {...resolveRequestContext({ipCountry: country, acceptLanguage: 'fr-FR,fr;q=0.9', environment: 'production'})},
      {country, offerCountry: country, locale},
    );
  });
}

test('unmapped IP country keeps country for diagnostics but selects US offer and Accept-Language locale', () => {
  const result = resolveRequestContext({ipCountry: 'MZ', acceptLanguage: 'pt-PT,pt;q=0.9', environment: 'production'});
  assert.equal(result.country, 'MZ');
  assert.equal(result.offerCountry, 'US');
  assert.equal(result.locale, 'pt-PT');
});

test('manual locale cookie changes language but never the IP-derived offer country', () => {
  const result = resolveRequestContext({ipCountry: 'BR', manualLocale: 'it', acceptLanguage: 'en', environment: 'production'});
  assert.equal(result.locale, 'it');
  assert.equal(result.country, 'BR');
  assert.equal(result.offerCountry, 'BR');
});

test('current IP overwrites an old NEXT_COUNTRY cookie in production', () => {
  const result = resolveRequestContext({ipCountry: 'IT', cookieCountry: 'BR', environment: 'production'});
  assert.equal(result.country, 'IT');
  assert.equal(result.offerCountry, 'IT');
  assert.equal(result.locale, 'it');
});

test('missing IP ignores stale production cookie, uses Accept-Language and US offer fallback', () => {
  const result = resolveRequestContext({ipCountry: null, cookieCountry: 'BR', acceptLanguage: 'pt-BR,pt;q=0.9', environment: 'production'});
  assert.equal(result.country, null);
  assert.equal(result.offerCountry, 'US');
  assert.equal(result.locale, 'pt-BR');
});

test('preview allows query override and cookie override without VPN', () => {
  assert.equal(resolveRequestContext({ipCountry:'US', overrideCountry:'IT', environment:'preview'}).offerCountry, 'IT');
  assert.equal(resolveRequestContext({ipCountry:'US', cookieCountry:'ZA', environment:'preview'}).offerCountry, 'ZA');
  assert.equal(resolveRequestContext({ipCountry:'US', overrideCountry:'BR', environment:'production'}).offerCountry, 'US');
});

test('middleware always reads the current IP and refreshes or clears NEXT_COUNTRY', () => {
  const middleware = fs.readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /req\.headers\.get\('x-vercel-ip-country'\)/);
  assert.match(middleware, /intlResponse\.cookies\.set\('NEXT_COUNTRY', context\.country/);
  assert.match(middleware, /intlResponse\.cookies\.delete\('NEXT_COUNTRY'\)/);
  assert.match(middleware, /req\.nextUrl\.searchParams\.get\('country'\)/);
  assert.match(middleware, /process\.env\.VERCEL_ENV !== 'production'/);
});


test('middleware does not mutate immutable request headers and guards next-intl routing', async () => {
  const source = fs.readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /req\.headers\.set\(/);
  assert.match(source, /try \{\s*intlResponse = handleI18nRouting\(req\);\s*\} catch/);
});
