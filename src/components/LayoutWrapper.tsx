'use client';

import Footer from '@/app/money-tracker/_components/Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div
      className={`flex flex-col min-h-[100dvh] layout-wrapper ${
        isHome ? '' : 'pt-12 md:pt-16'
      }`}
    >
      <main className={`flex-1 ${isHome ? '' : 'p-4'}`}>{children}</main>
      <Footer />
    </div>
  );
}
