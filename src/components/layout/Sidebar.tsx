'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { docNav } from '@/lib/docs';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
      <nav className="p-6 space-y-8">
        {docNav.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wide">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
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
    </aside>
  );
}
