import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Teraplan — Kredity na terapiu, ktorá vám sadne',
  description: 'Predplatné, ktoré z mesačných eur tvorí kredity na terapiu u Hedepy, Ksebe a Mojra.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
