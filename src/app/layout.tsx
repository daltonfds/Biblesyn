import './globals.css';
import type {Metadata, Viewport} from 'next';
import {Source_Serif_4, Inter} from 'next/font/google';
import Nav from '@/components/Nav';
const serif = Source_Serif_4({subsets: ['latin'], variable: '--serif', style: ['normal', 'italic']});
const sans = Inter({subsets: ['latin'], variable: '--sans'});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {default: 'Biblesyn', template: '%s · Biblesyn'},
  description: 'Understand the Word. Strengthen Your Spirit.',
  openGraph: {siteName: 'Biblesyn', type: 'website'},
};
export const viewport: Viewport = {themeColor: '#ffffff', viewportFit: 'cover'};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (<html lang="en" className={`${serif.variable} ${sans.variable}`}><body className="min-h-screen font-sans antialiased"><main className="mx-auto max-w-md pb-28">{children}</main><Nav /></body></html>);
}
