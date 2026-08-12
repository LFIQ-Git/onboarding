# Task 3: Add MDX Content Rendering & Interactive Components

## Overview
Integrate MDX (markdown with embedded JSX) to render the content files from Task 1 as interactive web pages. This task:
- Adds next-mdx-remote for markdown rendering
- Creates interactive components (CodeBlock, VideoEmbed, Callout, Table)
- Sets up dynamic routing to render all doc pages
- Ensures seamless styling integration with Tailwind
- Makes the app's navigation tree (from Task 1) lead to actual rendered pages

By the end, visiting `/docs/getting-started/setup` will render `src/content/getting-started/setup.md` with live code blocks, embedded videos, and styled callouts.

## Files to Create

**Interactive components:**
- `src/components/content/CodeBlock.tsx` — Code blocks with syntax highlighting and copy-to-clipboard button
- `src/components/content/VideoEmbed.tsx` — Responsive video player with title and duration
- `src/components/content/Callout.tsx` — Info/warning/danger/success callout boxes
- `src/components/content/Table.tsx` — Styled markdown tables

**MDX utilities:**
- `src/lib/mdx.ts` — MDX compilation and component mapping
- `src/lib/content.ts` — File system reading, metadata extraction, content tree building

**Dynamic routes:**
- `src/app/docs/[...slug]/page.tsx` — Dynamic route handler for all doc pages (matches routes like /docs/getting-started/setup, /docs/apps/hub, etc.)
- `src/app/docs/[...slug]/layout.tsx` — Optional: layout wrapper for individual doc pages (breadcrumbs, table of contents, related docs)

**Configuration updates:**
- `next.config.ts` — Update to include @next/mdx and configure MDX options
- `package.json` — Update if needed for MDX dependencies

## Component Requirements

### CodeBlock (`src/components/content/CodeBlock.tsx`)
**Props:**
```typescript
interface CodeBlockProps {
  children: string
  language?: string  // 'bash', 'typescript', 'jsx', 'json', etc.
  filename?: string  // optional: show filename above code
  highlight?: number[]  // optional: highlight specific line numbers
}
```

**Features:**
- Display code in dark background (gray-950)
- Language syntax highlighting (use `<code className="language-bash">` format)
- Copy-to-clipboard button (top-right, Lucide Copy icon)
- Show "Copied!" for 2 seconds after clicking copy
- Support for optional filename display above code
- Responsive: scrolls horizontally on small screens
- Inline: wrapped in `<div className="relative my-4 rounded-lg bg-gray-950 p-4">`

**Usage in MDX:**
```mdx
<CodeBlock language="bash">
npm install
</CodeBlock>
```

### VideoEmbed (`src/components/content/VideoEmbed.tsx`)
**Props:**
```typescript
interface VideoEmbedProps {
  src: string  // path to video file (e.g., /videos/setup.mp4)
  title: string
  duration?: string  // optional: "10 min"
}
```

**Features:**
- HTML5 `<video>` element with controls
- Responsive: full width, maintains aspect ratio
- `<figcaption>` below with title and duration
- Styling: rounded-lg, max-width 100%, centered

**Usage in MDX:**
```mdx
<VideoEmbed src="/videos/setup-and-local-dev.mp4" title="Setup & Local Dev" duration="10 min" />
```

### Callout (`src/components/content/Callout.tsx`)
**Props:**
```typescript
interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success'
  title?: string
  children: React.ReactNode
}
```

**Types with styling:**
- **info** (blue): bg-blue-50 dark:bg-blue-950, border-blue-200 dark:border-blue-800, icon Info
- **warning** (yellow): bg-yellow-50 dark:bg-yellow-950, border-yellow-200 dark:border-yellow-800, icon AlertTriangle
- **danger** (red): bg-red-50 dark:bg-red-950, border-red-200 dark:border-red-800, icon AlertCircle
- **success** (green): bg-green-50 dark:bg-green-950, border-green-200 dark:border-green-800, icon CheckCircle

**Layout:**
- Left border (4px)
- Icon + content side-by-side
- Bold title (optional)
- Content below title

**Usage in MDX:**
```mdx
<Callout type="warning" title="Neon Cold Start">
  Takes ~40 seconds on first request. Warm it with `select 1`.
</Callout>
```

### Table (`src/components/content/Table.tsx`)
**Props:**
```typescript
interface TableProps {
  children: React.ReactNode  // thead + tbody
}
```

**Features:**
- Wraps markdown-rendered table HTML
- Styled with Tailwind (borders, padding, striping)
- Dark mode support
- Responsive: overflow-x-auto on small screens

**Usage in MDX:**
```mdx
| URL | Purpose |
|-----|---------|
| hub.lfiq.app | Entry point |
```
(Rendered by markdown parser, wrapped by Table component)

## MDX Integration

### Configuration (next.config.ts)
**Add MDX support:**
```typescript
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    jsx: true,
  },
})

export default withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})
```

### File Reading (src/lib/mdx.ts)
**Export functions:**
```typescript
export async function getDocBySlug(slug: string[]): Promise<{
  content: string
  metadata?: { title?: string; description?: string }
}>

export async function getAllDocSlugs(): Promise<string[][]>

export const mdxComponents = {
  CodeBlock,
  VideoEmbed,
  Callout,
  Table,
  // ... markdown element mappings (a, h2, h3, p, ul, ol, li, code, pre, blockquote)
}
```

**Slug to file mapping:**
- Slug: `['getting-started', 'setup']` → File: `src/content/getting-started/setup.md`
- Slug: `['apps', 'hub']` → File: `src/content/apps/hub.md`
- Slug: `['reference', 'cheat-sheet']` → File: `src/content/reference/cheat-sheet.md`

### Dynamic Route (src/app/docs/[...slug]/page.tsx)
**Exports:**
- `generateStaticParams()` — Returns all doc slugs (for static generation)
- `generateMetadata()` — Sets page title/description from document
- Default export `Page` component

**Page component:**
1. Gets slug from params
2. Reads markdown file via `getDocBySlug(slug)`
3. Compiles markdown with `compileMDX()` and passes `mdxComponents`
4. Renders compiled content with proper layout (heading, breadcrumbs, content, related docs)

**Error handling:**
- If file not found (404): render NotFound page
- If compilation fails: render error message (dev mode shows error details)

## Markdown Element Mappings

**Headings:**
- `<h2>` → styled with Tailwind (text-2xl font-bold mb-4 mt-8)
- `<h3>` → styled (text-xl font-bold mb-3 mt-6)

**Paragraphs & Lists:**
- `<p>` → (mb-4 leading-relaxed)
- `<ul>/<ol>` → (mb-4 list-inside list-disc/list-decimal space-y-2)
- `<li>` → (ml-2)

**Inline code:**
- `<code>` → (rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800)

**Links:**
- `<a>` → (text-blue-600 hover:underline dark:text-blue-400)

**Blockquotes:**
- `<blockquote>` → (border-l-4 border-gray-300 pl-4 italic dark:border-gray-700)

**Code blocks & tables:**
- `<pre>` → (CodeBlock component via MDX)
- `<table>` → (Table component via MDX)

## Success Criteria

- [ ] All 4 interactive components created (CodeBlock, VideoEmbed, Callout, Table)
- [ ] MDX utilities file (mdx.ts) reads markdown from disk, compiles with next-mdx-remote
- [ ] Dynamic route handler created and renders all doc pages correctly
- [ ] All doc pages from Task 1 are accessible via /docs/* routes
- [ ] Code blocks render with copy button and syntax highlighting
- [ ] Videos embed and play correctly
- [ ] Callouts display with correct colors and icons
- [ ] Tables render with proper styling
- [ ] Markdown headings, lists, links render correctly
- [ ] Dark mode works for all components and markdown elements
- [ ] TypeScript compilation succeeds (zero errors)
- [ ] Static generation works: `npm run build` pre-renders all doc pages
- [ ] Error page appears for 404 (non-existent doc routes)

## Self-Review Before Committing

- [ ] All 4 components created and properly exported
- [ ] No unused imports or variables
- [ ] TypeScript strict mode passes: `npm run type-check`
- [ ] Build succeeds: `npm run build` (pre-renders all doc pages)
- [ ] All doc pages render without errors:
  - [ ] `/docs/getting-started/setup` renders
  - [ ] `/docs/architecture` renders
  - [ ] `/docs/apps/hub` renders
  - [ ] `/docs/apps/intel` renders (check for multi-source references)
  - [ ] `/docs/reference/cheat-sheet` renders (check for table display)
- [ ] Code block copy button works
- [ ] Video embed responsive
- [ ] Callouts display with correct styling
- [ ] Tables render with proper borders and alignment
- [ ] Breadcrumbs (if included) show current page
- [ ] No 404 errors for valid doc routes
- [ ] Dark mode transitions smoothly
- [ ] Sidebar active state still works on docs pages
