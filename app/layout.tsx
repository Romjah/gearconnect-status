import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GearConnect Status',
  description: 'Real-time status and monitoring for GearConnect services',
  keywords: 'status, monitoring, uptime, GearConnect',
  authors: [{ name: 'GearConnect Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'GearConnect Status',
    description: 'Real-time status and monitoring for GearConnect services',
    type: 'website',
    siteName: 'GearConnect Status',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GearConnect Status',
    description: 'Real-time status and monitoring for GearConnect services',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
} 