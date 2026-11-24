import type { Metadata } from 'next';
import { Open_Sans, Yellowtail } from 'next/font/google';
import './globals.css';
import SmoothScroll from '../components/SmoothScroll';
import Preloader from '../components/Preloader';
import Script from 'next/script';

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

const SITE = 'https://gianbportfolio.netlify.app';
const DESCRIPTION =
  'Production-grade automation, AI agents and voice AI for agencies and publishers. See the builds, talk to my AI clone, or book a 20-minute call.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Gian Benedict · Automation Specialist',
  description: DESCRIPTION,
  openGraph: {
    title: 'Gian Benedict · Automation Specialist',
    description: DESCRIPTION,
    url: SITE,
    siteName: 'Gian Benedict',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gian Benedict · Automation Specialist',
    description: DESCRIPTION,
  },
};

export const viewport = {
  themeColor: '#F0E5D8',
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
    <html lang="en" className={`${sans.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        {/* Before first paint: skip the loader on repeat visits and for Reduce Motion. */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {"try{if(sessionStorage.getItem('gb-intro')==='1'||(matchMedia('(prefers-reduced-motion: reduce)').matches&&localStorage.getItem('gb-motion')!=='full'))document.documentElement.classList.add('intro-seen');if(localStorage.getItem('gb-motion')==='full')document.documentElement.classList.add('motion-full')}catch(e){}"}
        </Script>
        {/* Before first paint: restore the visitor's lights-on / lights-off choice. */}
        <Script id="theme-gate" strategy="beforeInteractive">
          {"try{if(localStorage.getItem('gb-theme')==='night')document.documentElement.classList.add('night')}catch(e){}"}
        </Script>
      </head>
      <body className="font-body">
        <div className="grain"></div>
        <Preloader />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
