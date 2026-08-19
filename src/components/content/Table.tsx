'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Filter, X } from 'lucide-react';

interface TableProps {
  children: React.ReactNode;
}

/** A table lifted out of the server-rendered markdown into plain data. */
interface TableData {
  headers: string[];
  rows: Array<{ html: string[]; text: string[] }>;
}

type SortDirection = 'asc' | 'desc';

/**
 * Every markdown table in the manual renders through here, so sorting and
 * filtering are wired once rather than per page.
 *
 * The server output is the source of truth: it renders first as the no-JS
 * fallback, gets read out of the DOM on mount, and is then replaced by a
 * controlled table built from that data. Reading the DOM instead of walking
 * the MDX children keeps this working no matter what a cell contains.
 */
export function Table({ children }: TableProps) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TableData | null>(null);
  const [paramKey, setParamKey] = useState('t');

  useEffect(() => {
    const table = sourceRef.current?.querySelector('table');
    if (!table) return;

    const headers = Array.from(table.querySelectorAll('thead th')).map(
      (th) => th.innerHTML,
    );
    if (headers.length === 0) return;

    const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      return {
        html: cells.map((td) => td.innerHTML),
        text: cells.map((td) => (td.textContent ?? '').trim()),
      };
    });
    if (rows.length === 0) return;

    // Pages can hold several tables, so each needs its own search params.
    // Ordinal position is stable for a given page and survives a reload.
    const all = Array.from(document.querySelectorAll('[data-doc-table]'));
    const index = all.indexOf(sourceRef.current!.parentElement!);
    setParamKey(`t${index < 0 ? 0 : index}`);

    setData({ headers, rows });
  }, []);

  if (!data) {
    return (
      <div data-doc-table className="my-4">
        <div
          ref={sourceRef}
          className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      </div>
    );
  }

  return <InteractiveTable data={data} paramKey={paramKey} />;
}

function InteractiveTable({
  data,
  paramKey,
}: {
  data: TableData;
  paramKey: string;
}) {
  const sortParam = `${paramKey}sort`;
  const dirParam = `${paramKey}dir`;
  const filterPrefix = `${paramKey}f`;

  const [sort, setSort] = useState<{ column: number; direction: SortDirection } | null>(
    null,
  );
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Read state out of the URL once the component is live on the client, so a
  // reload and a shared link both land on the same view.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const column = Number(params.get(sortParam));
    if (params.has(sortParam) && Number.isInteger(column)) {
      const direction = params.get(dirParam) === 'desc' ? 'desc' : 'asc';
      setSort({ column, direction });
    }

    const restored: Record<number, string> = {};
    params.forEach((value, key) => {
      if (!key.startsWith(filterPrefix)) return;
      const column = Number(key.slice(filterPrefix.length));
      if (Number.isInteger(column) && value) restored[column] = value;
    });
    if (Object.keys(restored).length > 0) {
      setFilters(restored);
      setShowFilters(true);
    }
  }, [sortParam, dirParam, filterPrefix]);

  function writeParams(
    nextSort: typeof sort,
    nextFilters: Record<number, string>,
  ) {
    const params = new URLSearchParams(window.location.search);

    params.delete(sortParam);
    params.delete(dirParam);
    if (nextSort) {
      params.set(sortParam, String(nextSort.column));
      params.set(dirParam, nextSort.direction);
    }

    Array.from(params.keys())
      .filter((key) => key.startsWith(filterPrefix))
      .forEach((key) => params.delete(key));
    Object.entries(nextFilters).forEach(([column, value]) => {
      if (value) params.set(`${filterPrefix}${column}`, value);
    });

    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );
  }

  function toggleSort(column: number) {
    // Third click clears the sort and restores document order, which for these
    // tables is usually the order the author meant.
    const next =
      sort?.column !== column
        ? { column, direction: 'asc' as SortDirection }
        : sort.direction === 'asc'
          ? { column, direction: 'desc' as SortDirection }
          : null;

    setSort(next);
    writeParams(next, filters);
  }

  function setFilter(column: number, value: string) {
    const next = { ...filters };
    if (value) next[column] = value;
    else delete next[column];

    setFilters(next);
    writeParams(sort, next);
  }

  function clearFilters() {
    setFilters({});
    writeParams(sort, {});
  }

  const visibleRows = useMemo(() => {
    const active = Object.entries(filters).filter(([, value]) => value);

    const filtered = data.rows.filter((row) =>
      active.every(([column, value]) =>
        (row.text[Number(column)] ?? '')
          .toLowerCase()
          .includes(value.toLowerCase()),
      ),
    );

    if (!sort) return filtered;

    const sorted = [...filtered].sort((a, b) =>
      compareCells(a.text[sort.column] ?? '', b.text[sort.column] ?? ''),
    );
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [data.rows, filters, sort]);

  const filterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div data-doc-table className="my-4">
      <div className="mb-2 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <button
          type="button"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 font-medium hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
          {filterCount > 0 && (
            <span className="rounded bg-blue-600 px-1 text-[10px] font-semibold text-white">
              {filterCount}
            </span>
          )}
        </button>

        {filterCount > 0 && (
          <>
            <span>
              {visibleRows.length} of {data.rows.length} rows
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 hover:underline"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear
            </button>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              {data.headers.map((header, column) => {
                const active = sort?.column === column;
                const Icon = !active
                  ? ChevronsUpDown
                  : sort.direction === 'asc'
                    ? ArrowUp
                    : ArrowDown;

                return (
                  <th
                    key={column}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                    className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className="group inline-flex items-center gap-1.5 text-left hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <span dangerouslySetInnerHTML={{ __html: header }} />
                      <Icon
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 shrink-0 ${
                          active
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 opacity-0 transition-opacity group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  </th>
                );
              })}
            </tr>

            {showFilters && (
              <tr>
                {data.headers.map((_, column) => (
                  <th key={column} scope="col" className="px-4 pb-2">
                    <input
                      type="text"
                      value={filters[column] ?? ''}
                      onChange={(event) => setFilter(column, event.target.value)}
                      placeholder="Filter"
                      aria-label={`Filter by column ${column + 1}`}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs font-normal text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {visibleRows.map((row, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {row.html.map((cell, column) => (
                  <td
                    key={column}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: cell }}
                  />
                ))}
              </tr>
            ))}

            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={data.headers.length}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No rows match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Compare two cells so a column of numbers or dates sorts the way it reads
 * rather than alphabetically. Em dashes and other placeholders sort last in
 * ascending order so real values stay together at the top.
 */
function compareCells(a: string, b: string): number {
  const aEmpty = isPlaceholder(a);
  const bEmpty = isPlaceholder(b);
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  const aNumber = toNumber(a);
  const bNumber = toNumber(b);
  if (aNumber !== null && bNumber !== null) return aNumber - bNumber;

  const aDate = Date.parse(a);
  const bDate = Date.parse(b);
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return aDate - bDate;

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function isPlaceholder(value: string): boolean {
  return value === '' || value === '—' || value === '-' || value === 'n/a';
}

function toNumber(value: string): number | null {
  const cleaned = value.replace(/[$,%\s,]/g, '');
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
