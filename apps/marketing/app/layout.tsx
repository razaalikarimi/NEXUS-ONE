import type { Metadata } from 'next';
import '@nexus-one/design-tokens/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NEXUS ONE — Build. Observe. Automate. Understand.',
    template: '%s | NEXUS ONE',
  },
  description:
    'NEXUS ONE is a unified enterprise AI and developer platform with seven integrated products: AgentForge, PulseOps, GateFlow, CortexRAG, SyncSpace, SentinelX, and CloudPilot.',
  metadataBase: new URL(process.env['MARKETING_URL'] || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NEXUS ONE',
    title: 'NEXUS ONE — Build. Observe. Automate. Understand.',
    description:
      'Unified enterprise AI and developer platform with seven integrated products.',
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
