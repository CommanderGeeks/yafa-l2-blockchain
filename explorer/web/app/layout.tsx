import './globals.css';
import { Inter } from 'next/font/google';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'YAFA Explorer - L2 Block Explorer',
  description: 'Real-time blockchain explorer for the YAFA Layer 2 network. Track transactions, explore blocks, and monitor network activity.',
  keywords: 'YAFA, blockchain, explorer, L2, Layer 2, Ethereum, transactions, blocks',
  authors: [{ name: 'YAFA Team' }],
  openGraph: {
    title: 'YAFA Explorer - L2 Block Explorer',
    description: 'Real-time blockchain explorer for the YAFA Layer 2 network',
    url: 'https://explorer.yafa.network',
    siteName: 'YAFA Explorer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YAFA Explorer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YAFA Explorer - L2 Block Explorer',
    description: 'Real-time blockchain explorer for the YAFA Layer 2 network',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400 antialiased`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}