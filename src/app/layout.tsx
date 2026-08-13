import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';

// Self-hosted rather than pulled from next/font/google. Google Fonts is
// fetched at build time, so a network blip against fonts.gstatic.com fails the
// whole Vercel build. Manrope is the BRICK family display face and is used on
// the hub cover so this app reads as part of the same fleet.
const inter = localFont({
  src: './fonts/inter-latin-var.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
});

const manrope = localFont({
  src: './fonts/manrope-latin-var.woff2',
  variable: '--font-manrope',
  weight: '200 800',
  display: 'swap',
});

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
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
