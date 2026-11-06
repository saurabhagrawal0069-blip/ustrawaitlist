import type { Metadata } from 'next';
import './globals.css';
import './bilingual.css';

export const metadata: Metadata = {
  title: 'USTRA — Your Style. Our Priority.',
  description: 'Join the USTRA early access waitlist as a customer or grooming business.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
