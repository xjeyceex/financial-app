'use client';

import { GlobeIcon } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 border-t border-gray-200 dark:border-zinc-700 mt-8 bg-white dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-2">
        <div className="text-center sm:text-left">
          Built with 💻 by{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Jc Miguel Beltran
          </span>{' '}
          © {year}
        </div>
        <div className="flex space-x-4">
          <a
            href="https://github.com/xjeyceex"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-white transition"
          >
            <FaGithub className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/jc-miguel-beltran/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-white transition"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
          {/* Optional: Add your personal website */}
          <a
            href="https://jcmiguel-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-white transition"
          >
            <GlobeIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
