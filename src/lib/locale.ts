import {cookies} from 'next/headers';
export const LOCALES = ['en', 'pt', 'fr', 'es'] as const;
export function getLocale(): string { const v = cookies().get('locale')?.value; return v && (LOCALES as readonly string[]).includes(v) ? v : 'en'; }
