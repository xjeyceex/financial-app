'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { HiMenu, HiMoon, HiSun, HiX } from 'react-icons/hi';
import { useTheme } from 'next-themes';
import { IconType } from 'react-icons';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { FaClock, FaWallet, FaQuestionCircle, FaBook } from 'react-icons/fa';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DownloadAppButton } from './DownloadApp';
import { FiDownload } from 'react-icons/fi';

type NavItem = {
  name: string;
  href: string;
  icon: IconType;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    name: 'Recurring Budget',
    href: '/recurring',
    icon: FaClock,
  },
  {
    name: 'One-Time Budget',
    href: '/one-time',
    icon: FaWallet,
  },
   {
    name: 'Documentation',
    href: '/docs',
    icon: FaBook,
  },
  {
    name: 'FAQ',
    href: '/faq',
    icon: FaQuestionCircle,
  },
];

const API_KEY = 'gTVjhC2hMocWMuE6USgdzw==AhdFcUSkSZLqN0aY';
const COUNTER_ID = 'pesowise-download';

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [downloadCount, setDownloadCount] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchDownloadCount = async () => {
      try {
        const res = await fetch(`https://api.api-ninjas.com/v1/counter?id=${COUNTER_ID}`, {
          method: 'GET',
          headers: { 'X-Api-Key': API_KEY },
        });
        if (res.ok) {
          const data = await res.json();
          setDownloadCount(data.value);
        }
      } catch (err) {
        console.error('Failed to fetch download count:', err);
      }
    };
    fetchDownloadCount();
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
        key={item.href}
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
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-700 px-4 flex items-center justify-between">
        <Link
          href="/?home=true"
          className="text-xl font-semibold text-gray-800 dark:text-white"
        >
          PesoWise
        </Link>
        <div className="flex items-center gap-2">
          {/* Theme Toggle with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          {/* Download App Button */}
          <DownloadAppButton href="https://drive.google.com/drive/u/0/folders/1LatStDgvxedKOSuBwWUfs1b54rwsIgTg"/>
          {/* Sidebar Toggle */}
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
        ref={sidebarRef}
        className={clsx(
          'fixed top-16 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-zinc-900 shadow-lg p-6 z-40',
          'transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-zinc-700',
          'right-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!sidebarOpen}
      >
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map(renderLink)}
        </nav>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} PesoWise
          {downloadCount !== null && (
            <p className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
              <FiDownload className="w-3.5 h-3.5" />
              {downloadCount.toLocaleString()} downloads
            </p>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
