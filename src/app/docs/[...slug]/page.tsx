import { getDocBySlug, getAllDocSlugs } from '@/lib/mdx';
import { getBreadcrumbs, getAdjacentDocs } from '@/lib/docs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllDocSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const resolvedParams = await params;
  try {
    const { metadata } = await getDocBySlug(resolvedParams.slug);
    return {
      title: metadata?.title || resolvedParams.slug.join(' / '),
      description: metadata?.description || 'LFIQ Onboarding Manual',
    };
  } catch {
    return {
      title: 'Document Not Found',
      description: 'LFIQ Onboarding Manual',
    };
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  let docData;

  try {
    docData = await getDocBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  const href = `/docs/${resolvedParams.slug.join('/')}`;
  const breadcrumbs = getBreadcrumbs(href);
  const { prev, next } = getAdjacentDocs(href);

  return (
    <article className="w-full">
      {/* Breadcrumbs */}
      <nav className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-gray-900 dark:hover:text-gray-50">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-50 font-semibold">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Content */}
      <div className="max-w-none">
        {docData.content}
      </div>

      {/* Navigation */}
      <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
              <div className="font-semibold text-gray-900 dark:text-gray-50">
                {prev.label}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors ml-auto"
          >
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Next</div>
              <div className="font-semibold text-gray-900 dark:text-gray-50">
                {next.label}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
