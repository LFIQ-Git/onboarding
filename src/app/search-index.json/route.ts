import { buildSearchIndex } from '@/lib/search-index';

// Generated once at build time and served as a static asset, so search costs
// nothing at runtime.
export const dynamic = 'force-static';

export async function GET() {
  const index = await buildSearchIndex();

  return Response.json(index, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
