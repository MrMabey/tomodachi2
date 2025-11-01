// COMMENTED OUT FOR STATIC EXPORT (GitHub Pages)
// Uncomment when using server-side rendering with API routes
//
// import { source } from '@/lib/source';
// import { createFromSource } from 'fumadocs-core/search/server';
//
// export const { GET } = createFromSource(source, {
//   // https://docs.orama.com/docs/orama-js/supported-languages
//   language: 'english',
// });

// Dummy export to keep TypeScript happy
export const dynamic = 'force-static';
export function GET() {
  return new Response('Search API disabled for static export', { status: 404 });
}
