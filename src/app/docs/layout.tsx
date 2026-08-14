import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Sidebar only. Header and Footer are in the root layout, because they
 * belong to the whole manual rather than to /docs.
 *
 * They lived here for as long as `/` was the Green Monster hub cover, which
 * deliberately wore no manual chrome. That hub has moved to brick.home's
 * Gallery, `/` is the manual's landing page again, and chrome scoped to
 * /docs would leave that landing page with no header, footer or navigation.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        {/*
         * A <div>, not a <main>. The root layout already renders the page's
         * one <main>, and nesting a second inside it is invalid HTML: the
         * spec allows a single main landmark per document and forbids one
         * being a descendant of another. The pre-hub version of this file
         * had exactly that bug; restoring it verbatim brought it back, so
         * this is the one deliberate deviation from that version.
         */}
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
