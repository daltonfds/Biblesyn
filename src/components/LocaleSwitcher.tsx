'use client';
import {useTransition} from 'react';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing, type AppLocale} from '@/i18n/routing';

const NAMES: Record<AppLocale, string> = {
  en: 'English',
  'en-ZA': 'English (South Africa)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

export default function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    if (!routing.locales.includes(next as AppLocale)) return;
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    document.cookie = `locale=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    startTransition(async () => {
      await fetch('/api/prefs', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({locale: next}),
      });
      router.replace(pathname, {locale: next as AppLocale});
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-mute">
      <span className="sr-only">Language</span>
      <select aria-label="Language" value={locale} disabled={pending} onChange={e => change(e.target.value)}
        className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink">
        {routing.locales.map(code => <option key={code} value={code}>{NAMES[code]}</option>)}
      </select>
    </label>
  );
}
