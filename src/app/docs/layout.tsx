import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Docs chrome lives here rather than in the root layout. The hub cover at `/`
 * is the front door for the whole portfolio, so it must not wear the
 * onboarding manual's header, search box and PDF link.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mt-16 flex flex-1">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
