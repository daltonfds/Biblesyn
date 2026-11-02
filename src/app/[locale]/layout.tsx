import '../globals.css';
import '../biblesyn.css';
import type {Metadata, Viewport} from 'next';
import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import I18nProvider from '@/components/I18nProvider';
import VisitorTracker from '@/components/VisitorTracker';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {getStrings} from '@/lib/i18n';
import {routing} from '@/i18n/routing';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blui.online'),
  title: {default: 'Biblesyn – Entenda a Palavra. Fortaleça seu Espírito.', template: '%s · Biblesyn'},
  description: 'Entenda a Palavra. Fortaleça seu Espírito.',
  openGraph: {siteName: 'Biblesyn', type: 'website'},
};
export const viewport: Viewport = {themeColor: '#ffffff', viewportFit: 'cover'};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const {locale} = params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  const strings = await getStrings(locale);
  return (
    <html lang={locale} style={{'--font-display': "'Bricolage Grotesque'", '--font-body': "'Figtree'"} as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">\n        <div className="mx-auto flex max-w-6xl justify-end px-4 pt-3"><LocaleSwitcher /></div>
        <NextIntlClientProvider>
          <I18nProvider strings={strings} locale={locale}>{children}</I18nProvider>
        </NextIntlClientProvider>
        <Suspense fallback={null}><VisitorTracker /></Suspense>
      </body>
    </html>
  );
}
