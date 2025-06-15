'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className={isHome ? '' : 'pt-12 md:pt-16 md:ml-72 min-h-[100dvh]'}>
      <main className={isHome ? '' : 'p-4'}>{children}</main>
    </div>
  );
}
