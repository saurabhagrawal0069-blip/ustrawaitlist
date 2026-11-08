import type { Metadata } from 'next';
import './globals.css';
import './bilingual.css';
import './share.css';

export const metadata: Metadata = {
  title: 'USTRA — Your Style. Our Priority.',
  description: 'Join the USTRA early access waitlist as a customer or grooming business.',
  // Shown when the link is shared on WhatsApp, Instagram, Facebook and others. Both languages.
  openGraph: {
    title: 'USTRA — Your Style. Our Priority.',
    description: 'Join the USTRA early access waitlist. USTRA की शुरुआती पहुँच वेटलिस्ट से जुड़ें।',
    type: 'website',
    siteName: 'USTRA',
    locale: 'en_IN',
    alternateLocale: ['hi_IN'],
  },
  twitter: {
    card: 'summary',
    title: 'USTRA — Your Style. Our Priority.',
    description: 'Join the USTRA early access waitlist. USTRA की शुरुआती पहुँच वेटलिस्ट से जुड़ें।',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
