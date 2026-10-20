import type { Metadata } from 'next';
import '@nexus-one/design-tokens/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NEXUS ONE — Enterprise Cloud & Developer Infrastructure',
    template: '%s | NEXUS ONE',
  },
  description:
    'NEXUS ONE is a unified cloud and developer infrastructure platform integrating workflow orchestration, observability, API gateway, knowledge intelligence, and real-time collaboration.',
  metadataBase: new URL(process.env['MARKETING_URL'] || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NEXUS ONE',
    title: 'NEXUS ONE — Enterprise Cloud & Developer Infrastructure',
    description:
      'Unified enterprise developer platform integrating workflow orchestration, observability, API gateway, knowledge intelligence, and real-time collaboration.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
