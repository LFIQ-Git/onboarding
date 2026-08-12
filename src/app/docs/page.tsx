import Link from 'next/link';
import { docNav } from '@/lib/docs';

export default function DocsIndex() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
        Documentation
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
        Browse all available documentation topics below or use the sidebar navigation to
        explore specific sections.
      </p>

      <div className="space-y-12">
        {docNav.map((section) => (
          <div key={section.title}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
