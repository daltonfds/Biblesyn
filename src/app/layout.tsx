import './globals.css';
import type {Metadata, Viewport} from 'next';
import I18nProvider from '@/components/I18nProvider';
import {getLocale} from '@/lib/locale';
import {getStrings} from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {default: 'Biblesyn – O sistema que edifica a sua jornada na fé', template: '%s · Biblesyn'},
  description: 'Entenda a Palavra. Fortaleça o seu espírito.',
  openGraph: {siteName: 'Biblesyn', type: 'website'},
};
export const viewport: Viewport = {themeColor: '#ffffff', viewportFit: 'cover'};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  const strings = await getStrings(locale);
  return (
    <html lang="pt-BR" style={{'--font-display': "'Bricolage Grotesque'", '--font-body': "'Figtree'"} as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <I18nProvider strings={strings} locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
