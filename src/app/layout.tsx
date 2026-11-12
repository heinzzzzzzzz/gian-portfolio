import type { Metadata } from 'next';
import { Syne, Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import SmoothScroll from '../components/SmoothScroll';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const instrument = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Gian Benedict Bigay — Automation Engineer',
  description:
    'Automation Engineer specializing in n8n. I build content pipelines, CRM systems, apps and websites that run themselves. Talk to my AI clone.',
  openGraph: {
    title: 'Gian Benedict Bigay — Automation Engineer',
    description: 'Systems that publish themselves. Automations, apps and websites by Gian Benedict Bigay.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${inter.variable} ${jetbrains.variable} ${instrument.variable} font-body`}>
        <div className="grain"></div>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
