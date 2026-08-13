'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText } from 'lucide-react';
import { docNav } from '@/lib/docs';
import { Search } from '@/components/layout/Search';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // The sidebar is hidden below lg, so this menu is the only navigation on
  // small screens. Close it on navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

        <Search className="hidden md:block flex-1 max-w-xs mx-8" />

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
            className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-900 dark:text-gray-50" />
            ) : (
              <Menu size={24} className="text-gray-900 dark:text-gray-50" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation. Carries the full doc tree, since the sidebar is
          hidden at this width. */}
      {mobileMenuOpen && (
        <nav className="lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4">
          <Search className="md:hidden mb-4" />

          {docNav.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-gray-900 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
