'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, FileText } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      <div className="container flex items-center justify-between h-16">
        {/* Logo and text */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded" />
          <span className="hidden sm:inline font-semibold text-gray-900 dark:text-gray-50">
            LFIQ Onboarding
          </span>
        </Link>

        {/* Center: Search (placeholder) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-8">
          <input
            type="text"
            placeholder="Search docs..."
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>

        {/* Right side: PDF link and mobile menu */}
        <div className="flex items-center gap-4">
          <a
            href="/api/pdf"
            download="lfiq-onboarding-manual.pdf"
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-900 transition-colors"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">PDF</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-900 dark:text-gray-50" />
            ) : (
              <Menu size={24} className="text-gray-900 dark:text-gray-50" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu search placeholder */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <input
            type="text"
            placeholder="Search docs..."
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>
      )}
    </header>
  );
}
