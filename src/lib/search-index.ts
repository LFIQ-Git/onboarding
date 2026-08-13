import fs from 'fs/promises';
import path from 'path';
import { docNav } from '@/lib/docs';
import { slugify } from '@/lib/slugify';

export interface SearchSection {
  /** Heading text this snippet sits under, empty for the page intro. */
  heading: string;
  /** Anchor slug for the heading, empty for the page intro. */
  anchor: string;
  /** Plain text used for matching and for the result preview. */
  text: string;
}

export interface SearchDoc {
  href: string;
  /** Sidebar label, so results read the same as the nav. */
  title: string;
  /** Sidebar section the page belongs to. */
  group: string;
  sections: SearchSection[];
}

export { slugify };

/**
 * Strip the markdown down to prose worth searching. Code fences and tables are
 * dropped because matching inside them produces unreadable previews, and the
 * surrounding prose already describes what they contain.
 */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_>#]/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a page into one entry per H2/H3 so results deep-link to the section. */
function splitIntoSections(markdown: string): SearchSection[] {
  const lines = markdown.split('\n');
  const sections: SearchSection[] = [];

  let heading = '';
  let buffer: string[] = [];
  let inFence = false;

  const flush = () => {
    const text = toPlainText(buffer.join('\n'));
    if (text.length > 0) {
      sections.push({ heading, anchor: heading ? slugify(heading) : '', text });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;

    const match = !inFence ? /^(#{2,3})\s+(.*)$/.exec(line) : null;
    if (match) {
      flush();
      heading = match[2].replace(/`/g, '').trim();
      continue;
    }

    // Skip the H1, its text duplicates the page title.
    if (!inFence && /^#\s+/.test(line)) continue;

    buffer.push(line);
  }

  flush();
  return sections;
}

/**
 * Build the search index from the markdown on disk. Called at build time and
 * served as a static JSON route, so there is no search backend to run.
 */
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const contentRoot = path.join(process.cwd(), 'src', 'content');
  const docs: SearchDoc[] = [];

  for (const section of docNav) {
    for (const item of section.items) {
      const relative = item.href.replace(/^\/docs\/?/, '');
      if (!relative) continue;

      const filePath = path.join(contentRoot, `${relative}.md`);

      let source: string;
      try {
        source = await fs.readFile(filePath, 'utf-8');
      } catch {
        // A nav entry with no file is a broken link, not a search problem.
        // The build-time link check is what should catch that.
        continue;
      }

      docs.push({
        href: item.href,
        title: item.label,
        group: section.title,
        sections: splitIntoSections(source),
      });
    }
  }

  return docs;
}
