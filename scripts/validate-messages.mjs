import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'messages', name + '.json'), 'utf8'));
const base = read('en');
const required = Object.keys(base);
const errors = [];

for (const locale of ['pt-BR', 'pt-PT', 'fr', 'es', 'it']) {
  const messages = read(locale);
  for (const key of required) if (!(key in messages)) errors.push(`${locale}: missing key "${key}"`);
  for (const key of Object.keys(messages)) if (!(key in base)) errors.push(`${locale}: unknown key "${key}"`);
}
const za = read('en-ZA');
for (const key of Object.keys(za)) if (!(key in base)) errors.push(`en-ZA: unknown override "${key}"`);

if (errors.length) {
  console.error(errors.join('\\n'));
  process.exit(1);
}
console.log(`Message validation passed: ${required.length} base keys; 5 complete translations; en-ZA overrides valid.`);
