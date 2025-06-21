'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { HiMenu, HiX, HiCurrencyDollar, HiMoon, HiSun } from 'react-icons/hi';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { IconType } from 'react-icons';

type NavItem = {
  name: string;
  href: string;
  icon: IconType;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    name: 'Money Tracker',
    href: '/money-tracker',
    icon: HiCurrencyDollar,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (!mounted) return null;

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + '/');

    const className = clsx(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium',
      'hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98]',
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
      'border-l-4',
      isActive ? 'border-blue-500 dark:border-blue-400' : 'border-transparent',
      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );

    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setSidebarOpen(false)}
        className={className}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16  bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 px-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold text-gray-800 dark:text-white"
        >
          PesoWise
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {resolvedTheme === 'dark' ? (
              <HiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <HiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <HiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <HiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-zinc-900 shadow-lg p-6 z-40',
          'transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-zinc-700',
          'right-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!sidebarOpen}
      >
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => (
            <div key={item.href}>{renderLink(item)}</div>
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} PesoWise
        </div>
      </aside>

      {/* Overlay - only on mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
