/**
 * GitHub-style heading anchor.
 *
 * Lives in its own module with no Node imports so both the server-side search
 * index builder and the MDX component map can use it without dragging `fs`
 * into a bundle.
 */
export function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
