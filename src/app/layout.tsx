import './globals.css';
// import Sidebar from '@/components/Sidebar';
import { Geist, Geist_Mono } from 'next/font/google';
import ThemeWrapper from '@/components/ThemeWrapper';
import LayoutWrapper from '@/components/LayoutWrapper';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'PesoWise',
  description: 'Track spending and make smarter decisions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeWrapper>
          {/* <Sidebar /> */}
          <Navbar />
          <LayoutWrapper>{children}</LayoutWrapper>
        </ThemeWrapper>
      </body>
    </html>
  );
}
