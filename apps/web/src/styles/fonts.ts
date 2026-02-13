import { Geist, JetBrains_Mono } from 'next/font/google';

export const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});
