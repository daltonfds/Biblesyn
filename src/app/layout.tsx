import './globals.css';
import { Poppins } from 'next/font/google';
import Nav from '@/components/Nav';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--poppins',
  display: 'swap',
});

export const metadata = {
  title: 'Biblesyn',
  description: 'Understand the Word. Strengthen Your Spirit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-white font-sans text-ink">
        <main className="mx-auto min-h-screen max-w-[520px] border-x border-[#F5F5F5] pb-28">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
