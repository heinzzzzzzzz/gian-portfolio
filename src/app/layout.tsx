import type { Metadata } from 'next';
import { Open_Sans, Yellowtail } from 'next/font/google';
import './globals.css';
import SmoothScroll from '../components/SmoothScroll';

// One sans family for headlines, body and labels. Open Sans is the closest
// web match to the Segoe UI look the site was designed around, and it loads
// the same on every device.
const sans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

// Script face for the neon signature, the GB logo and the AI callout.
// Swap here to retune: Kaushan_Script (bolder brush) or Sacramento (thin tube).
const script = Yellowtail({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
  weight: '400',
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
    // The font variables live on <html> so the theme tokens in globals.css,
    // which are defined at the root, can resolve them. (On <body> they could
    // not, and every font silently fell back to the system font.)
    <html lang="en" className={`${sans.variable} ${script.variable}`}>
      <body className="font-body">
        <div className="grain"></div>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
