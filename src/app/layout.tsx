import './globals.css';
import type {Metadata, Viewport} from 'next';
import {Source_Serif_4, Inter, Lora} from 'next/font/google';
import I18nProvider from '@/components/I18nProvider';
import {getLocale} from '@/lib/locale';
import {getStrings} from '@/lib/i18n';
const serif = Source_Serif_4({subsets: ['latin'], variable: '--serif', style: ['normal', 'italic']});
const sans = Inter({subsets: ['latin'], variable: '--sans'});
const classic = Lora({subsets: ['latin'], variable: '--classic'});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {default: 'Biblesyn', template: '%s · Biblesyn'},
  description: 'Understand the Word. Strengthen Your Spirit.', openGraph: {siteName: 'Biblesyn', type: 'website'},
};
export const viewport: Viewport = {themeColor: '#ffffff', viewportFit: 'cover'};
export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale(); const strings = await getStrings(locale);
  return (<html lang={locale} className={`${serif.variable} ${sans.variable} ${classic.variable}`}><body className="min-h-screen font-sans antialiased">
    <I18nProvider strings={strings} locale={locale}>{children}</I18nProvider></body></html>);
}
