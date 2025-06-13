'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  children?: NavItem[];
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
    children: [
      {
        name: 'Expenses',
        href: '/money-tracker/expenses',
        icon: HiCurrencyDollar,
        disabled: true,
      },
    ],
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
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const renderLink = (item: NavItem, isChild = false) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + '/');
    const className = clsx(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium',
      'hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98]',
      isActive
        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
      isChild && 'ml-6 text-sm',
      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );

    if (item.disabled) {
      return (
        <div className={className}>
          <Icon
            className={clsx(
              'w-5 h-5',
              isActive ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400'
            )}
          />
          <span>{item.name}</span>
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
            'w-5 h-5',
            isActive ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400'
          )}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Hamburger */}
      {!open && isMobile && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Open menu"
        >
          <HiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen w-72 bg-white dark:bg-zinc-900 shadow-xl p-6 border-r border-gray-100 dark:border-zinc-700 transition-all duration-300 ease-in-out z-40',
          'md:relative md:h-screen md:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span
              className={clsx(
                'p-2 rounded-lg',
                !mounted
                  ? 'bg-blue-100 text-blue-600'
                  : resolvedTheme === 'dark'
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-100 text-blue-600'
              )}
            >
              💼
            </span>
            <span>Finance App</span>
          </h2>
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close menu"
            >
              <HiX className="w-6 h-6 text-gray-500 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            return (
              <div key={item.href}>
                {renderLink(item)}

                {/* Render nested children */}
                {item.children && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => (
                      <div key={child.href}>{renderLink(child, true)}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Finance App
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <HiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <HiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
