import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/lib/offer.ts', import.meta.url), 'utf8');
const countries = ['BR','US','PT','IT','ZA'];
const missing = countries.filter(code => !new RegExp('^\\s*' + code + ':', 'm').test(source));
if (missing.length) { console.error('Missing offers:', missing.join(', ')); process.exitCode = 1; }
const todo = countries.filter(code => {
  const line = source.split(/\r?\n/).find(row => new RegExp('^\\s*' + code + ':').test(row));
  return !line || /checkoutUrl:\s*['"](?:TODO)?['"]/.test(line);
});
if (todo.length) console.warn('[Biblesyn offers] Checkout not configured yet for: ' + todo.join(', ') + '. Build continues; checkout buttons remain disabled.');
