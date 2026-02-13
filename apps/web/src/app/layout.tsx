import type { Metadata } from 'next';
import { geist, jetbrainsMono } from '@/styles/fonts';
import { Providers } from '@/components/layout/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cadence',
  description: 'Personal productivity system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
