'use client';

import { GlobeIcon } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
        {/* Left Section: Name & Copyright */}
        <div className="text-center sm:text-left">
          <p>
            © {year}{' '}
            <span className="font-semibold text-foreground">Jc Miguel</span>.
            All rights reserved.
          </p>
        </div>

        {/* Right Section: Social Links */}
        <div className="mt-3 sm:mt-0 flex items-center gap-4">
          <a
            href="https://github.com/xjeyceex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-foreground transition-colors"
          >
            <FaGithub className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/jc-miguel-beltran/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-foreground transition-colors"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a
            href="https://jcmiguel-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Portfolio"
            className="hover:text-foreground transition-colors"
          >
            <GlobeIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
