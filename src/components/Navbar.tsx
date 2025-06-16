'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';

export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 px-4 flex items-center justify-between">
      {/* Logo / Title */}
      <Link
        href="/"
        className="text-xl font-semibold text-gray-800 dark:text-white"
      >
        PesoWise
      </Link>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
      >
        {resolvedTheme === 'dark' ? (
          <HiSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <HiMoon className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </header>
  );
}
