'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import type { SearchDoc } from '@/lib/search-index';

interface Hit {
  href: string;
  title: string;
  group: string;
  heading: string;
  preview: string;
  score: number;
}

const MAX_RESULTS = 8;

/** Build a preview window centred on the first match. */
function preview(text: string, term: string): string {
  const at = text.toLowerCase().indexOf(term);
  if (at === -1) return text.slice(0, 140);

  const start = Math.max(0, at - 50);
  const slice = text.slice(start, start + 160).trim();
  return `${start > 0 ? '...' : ''}${slice}${start + 160 < text.length ? '...' : ''}`;
}

function search(docs: SearchDoc[], raw: string): Hit[] {
  const terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const hits: Hit[] = [];

  for (const doc of docs) {
    const title = doc.title.toLowerCase();

    for (const section of doc.sections) {
      const haystack = `${section.heading} ${section.text}`.toLowerCase();

      // Every term has to appear somewhere in the page for the section to
      // count, which keeps multi-word queries from matching on one word.
      const matched = terms.every(
        (t) => haystack.includes(t) || title.includes(t)
      );
      if (!matched) continue;

      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 10;
        if (section.heading.toLowerCase().includes(t)) score += 5;
        if (section.text.toLowerCase().includes(t)) score += 1;
      }

      hits.push({
        href: section.anchor ? `${doc.href}#${section.anchor}` : doc.href,
        title: doc.title,
        group: doc.group,
        heading: section.heading,
        preview: preview(section.text, terms[0]),
        score,
      });
    }
  }

  // Keep the best section per page so one long page cannot flood the results.
  const bestPerPage = new Map<string, Hit>();
  for (const hit of hits) {
    const existing = bestPerPage.get(hit.title);
    if (!existing || hit.score > existing.score) bestPerPage.set(hit.title, hit);
  }

  return [...bestPerPage.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}

export function Search({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loading = useRef(false);

  // Pull the index on first interaction so it never blocks first paint. Driven
  // from both focus and typing, because relying on focus alone leaves the
  // dropdown stuck on "Loading..." if focus never fires.
  const ensureIndex = async () => {
    if (docs !== null || loading.current) return;
    loading.current = true;
    try {
      const res = await fetch('/search-index.json');
      setDocs(res.ok ? await res.json() : []);
    } catch {
      setDocs([]);
    } finally {
      loading.current = false;
    }
  };

  const results = useMemo(
    () => (docs && query.trim() ? search(docs, query.trim()) : []),
    [docs, query]
  );

  useEffect(() => setActive(0), [query]);

  // Close when clicking outside.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Cmd+K / Ctrl+K to focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active].href);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search docs..."
          aria-label="Search documentation"
          onFocus={() => {
            void ensureIndex();
            setOpen(true);
          }}
          onChange={(e) => {
            void ensureIndex();
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded border border-gray-300 bg-white py-2 pl-9 pr-8 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {docs === null ? 'Loading...' : `No matches for "${query}"`}
            </p>
          ) : (
            <ul>
              {results.map((hit, i) => (
                <li key={hit.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit.href)}
                    className={`block w-full px-4 py-3 text-left transition-colors ${
                      i === active
                        ? 'bg-blue-50 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-50">
                        {hit.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {hit.group}
                      </span>
                    </div>
                    {hit.heading && (
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {hit.heading}
                      </div>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {hit.preview}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
