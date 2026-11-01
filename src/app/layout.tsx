import './globals.css';
import type {Metadata, Viewport} from 'next';
import {Bricolage_Grotesque, Figtree} from 'next/font/google';
import I18nProvider from '@/components/I18nProvider';
import {getLocale} from '@/lib/locale';
import {getStrings} from '@/lib/i18n';

const display = Bricolage_Grotesque({subsets: ['latin'], weight: ['700', '800'], variable: '--font-display'});
const body = Figtree({subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-body'});

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
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen antialiased">
        <I18nProvider strings={strings} locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
