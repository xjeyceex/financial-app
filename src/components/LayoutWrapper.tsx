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
    <div
      className={
        isHome ? 'min-h-screen' : 'pt-12 md:pt-16 md:ml-72 min-h-screen'
      }
    >
      <main className={isHome ? '' : 'p-4'}>{children}</main>
    </div>
  );
}
