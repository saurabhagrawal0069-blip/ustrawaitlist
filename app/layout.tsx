import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import './bilingual.css';
import './share.css';

const siteMetadata: Metadata = {
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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'USTRA — Your Style. Our Priority. · आपका स्टाइल। हमारी प्राथमिकता।',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'USTRA — Your Style. Our Priority.',
    description: 'Join the USTRA early access waitlist. USTRA की शुरुआती पहुँच वेटलिस्ट से जुड़ें।',
    images: ['/og-image.png'],
  },
};

// Link previews need full addresses (https://...). The address is read from the request,
// so it is correct on the workers.dev address and on any custom domain added later.
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(`${proto}://${host}`);
  } catch {
    // A malformed Host header must not break the page. Previews fall back to relative paths.
    metadataBase = undefined;
  }
  return { ...siteMetadata, metadataBase };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
