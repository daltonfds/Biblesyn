import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'messages', name + '.json'), 'utf8'));
function flatten(value, prefix = '', out = {}) {
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? prefix + '.' + key : key;
    if (typeof child === 'string') out[full] = child;
    else if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, out);
    else throw new Error(`Invalid message value at ${full}`);
  }
  return out;
}
const base = flatten(read('en'));
const required = Object.keys(base);
const errors = [];
for (const locale of ['pt-BR', 'pt-PT', 'fr', 'es', 'it']) {
  const messages = flatten(read(locale));
  for (const key of required) if (!(key in messages)) errors.push(`${locale}: missing key "${key}"`);
  for (const key of Object.keys(messages)) if (!(key in base)) errors.push(`${locale}: unknown key "${key}"`);
}
const za = flatten(read('en-ZA'));
for (const key of Object.keys(za)) if (!(key in base)) errors.push(`en-ZA: unknown override "${key}"`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Message validation passed: ${required.length} nested keys; 5 complete translations; en-ZA overrides valid.`);
