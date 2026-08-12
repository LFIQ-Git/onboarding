import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LFIQ Onboarding Manual',
  description: 'Complete guide to the LFIQ tech stack for new team members',
  openGraph: {
    title: 'LFIQ Onboarding Manual',
    description: 'Complete guide to the LFIQ tech stack for new team members',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LFIQ Onboarding Manual',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 mt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
