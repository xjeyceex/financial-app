'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  HiMenu,
  HiX,
  HiHome,
  HiCurrencyDollar,
  HiCalculator,
  HiMoon,
  HiSun,
} from 'react-icons/hi';
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
    name: 'Home',
    href: '/',
    icon: HiHome,
  },
  {
    name: 'Money Tracker',
    href: '/money-tracker',
    icon: HiCurrencyDollar,
  },
  {
    name: 'Worth It Calculator',
    href: '/worth-it',
    icon: HiCalculator,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 h-screen w-72 bg-white dark:bg-zinc-900 p-6 border-r border-gray-100 dark:border-zinc-700 hidden md:block">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg mb-8"></div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

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

    if (item.disabled) {
      return (
        <div className={className}>
          <Icon className="w-5 h-5 flex-shrink-0 text-gray-400" />
          <span className="truncate">{item.name}</span>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setOpen(false)}
        className={className}
      >
        <Icon
          className={clsx(
            'w-5 h-5 flex-shrink-0',
            isActive ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400'
          )}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className={clsx(
            'fixed top-4 left-4 z-50 p-2 rounded-full shadow-md transition-colors',
            'bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700',
            open ? 'transform translate-x-52' : ''
          )}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <HiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <HiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen w-72 bg-white dark:bg-zinc-900 shadow-xl p-6 border-r border-gray-100 dark:border-zinc-700 z-40',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
        aria-hidden={!open && isMobile}
      >
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => isMobile && setOpen(false)}
          >
            <span>Finance App</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => (
            <div key={item.href}>{renderLink(item)}</div>
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Finance App
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <HiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <HiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 cursor-pointer"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
