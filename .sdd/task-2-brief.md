# Task 2: Build Next.js App Shell & Layout

## Overview
Build the Next.js 15 web app foundation that will render the markdown content from Task 1. This includes:
- Root layout with responsive design
- Landing page (home)
- Docs layout with sidebar navigation
- Layout components (Header, Sidebar, Footer)
- Documentation navigation tree usage
- Tailwind CSS configuration with LFIQ brand colors

## Files to Create

**Core app files:**
- `src/app/layout.tsx` — Root layout (header, footer, dark mode support)
- `src/app/page.tsx` — Landing page with hero, quick links, content grid, video section, CTA
- `src/app/docs/layout.tsx` — Docs layout with sidebar
- `src/app/docs/page.tsx` — Docs index page

**Layout components:**
- `src/components/layout/Header.tsx` — Top header with logo, search box placeholder, PDF download, mobile menu
- `src/components/layout/Sidebar.tsx` — Left sidebar with docs navigation tree (from Task 1 docs.ts)
- `src/components/layout/Footer.tsx` — Footer with copyright, update date, feedback link

**Configuration & styles:**
- `src/styles/globals.css` — Tailwind setup, CSS variables for colors
- `next.config.ts` — Next.js config (image optimization, MDX setup)
- `tailwind.config.ts` — Tailwind theme with Zenith brand colors (blue, sage, purple accents)

**Utilities:**
- `src/lib/utils.ts` — Helper functions (cn for classname merging)

## Component Requirements

### Root Layout (`src/app/layout.tsx`)
**Must include:**
- HTML structure with lang="en"
- Metadata (title, description, open graph, favicon)
- Dark mode support (class-based, not theme provider)
- Inter font from Google Fonts
- Root flex container with header, main, footer
- Body background transitions between light/dark

**Key metadata:**
- Title: "LFIQ Onboarding Manual"
- Description: "Complete guide to the LFIQ tech stack for new team members"
- OG image: `/og-image.png` (1200x630)
- Favicon: `/favicon.ico`

### Landing Page (`src/app/page.tsx`)
**Must include:**
- Hero section: Large heading "LFIQ Tech Stack Onboarding" + subheading
- Three quick-link cards in grid: Getting Started (blue), Architecture (green), Cheat Sheet (purple)
- Main content grid (2 columns on desktop): Apps section (Hub, Intel, Command, Keystone), Guides section (Troubleshooting, Common Tasks, Daily Operations, Deployment)
- Video section (gray background): Three video cards (Setup 10min, Hub Login 5min, Intel Example 8min)
- CTA section (blue border, blue background): "Ready to dive in?" with "Begin Now" button
- All links are Next.js Links
- Responsive: Single column on mobile, 2+ columns on desktop

### Header Component
**Must include:**
- Logo (small blue square) + text "LFIQ Onboarding" (hidden on mobile)
- Search box placeholder (no-op for now, future enhancement)
- "PDF" link (points to `/api/pdf`, not implemented yet but link works)
- Mobile hamburger menu (toggle for search on small screens)
- Fixed position, border-bottom, responsive

### Sidebar Component
**Must include:**
- Left navigation tree from `src/lib/docs.ts`
- Active page highlighting (uses `usePathname()`)
- Sections group items with headers
- Indentation for hierarchy
- Hidden on mobile (lg: screen breakpoint)
- Scrollable, 64 width (16 * 4 Tailwind units)

### Docs Layout (`src/app/docs/layout.tsx`)
**Must include:**
- Two-column flex: Sidebar (fixed, hidden on mobile) + main content (flex-1, scrollable)
- Sidebar uses `<Sidebar />` component
- Main content has max-width container (max-w-3xl), centered, with padding

### Footer Component
**Must include:**
- Text: "LFIQ Onboarding Manual — Updated {today}. Questions? Ask in #engineering on Slack."
- Centered, small text, gray color
- Border-top, background gray-50 light / gray-900 dark

## Styling Requirements

**Tailwind configuration (`tailwind.config.ts`):**
- Extend colors with brand colors (blue palette: 50-900)
- Extend fonts with Inter (from Google Fonts)
- Dark mode: class-based (not system)

**Globals CSS (`src/styles/globals.css`):**
- Tailwind directives (@tailwind base, components, utilities)
- CSS reset (margin 0, padding 0 on common elements)
- Smooth scrolling
- Dark mode: body dark:bg-gray-950 dark:text-gray-50

**Component patterns:**
- All interactive elements have hover states
- Consistent spacing: use Tailwind units (px-4, py-8, gap-4, etc.)
- Consistent rounded corners (rounded, rounded-lg)
- Consistent borders (border, border-b, border-l-4)
- Typography: Inter font everywhere, font-semibold for headings, text-sm for labels

## Navigation Tree Integration

The Sidebar reads from `src/lib/docs.ts` (created in Task 1):
```typescript
import { docNav } from '@/lib/docs'

docNav.map(section => (
  <div key={section.title}>
    <h3>{section.title}</h3>
    {section.items.map(item => (
      <Link href={item.href}>{item.label}</Link>
    ))}
  </div>
))
```

## Configuration Files

**next.config.ts:**
- MDX integration (for Task 3)
- Image unoptimization (self-hosted images)
- App Router enabled (Next.js 15)

**tsconfig.json:**
- Path alias `@/*` → `./src/*`
- Strict mode enabled
- JSX = preserve (Next.js 15)

## Dark Mode

- Body element gets `dark:` classes
- All text: `text-gray-900 dark:text-gray-50`
- All backgrounds: `bg-white dark:bg-gray-950`
- Use `prefers-color-scheme` media query for system preference (but class-based toggle is primary)
- No JavaScript-based theme toggle yet (future enhancement)

## Accessibility & Responsive

**Mobile-first:**
- Single column layout on mobile
- Sidebar hidden on mobile (lg: breakpoint)
- Header hamburger menu for navigation
- Touch-friendly tap targets (min 44px)

**Keyboard navigation:**
- All links keyboard-accessible
- Tab order sensible
- Focus states visible (outline or shadow)

**Semantic HTML:**
- Use proper heading hierarchy (h1, h2, h3)
- Use nav, main, aside, footer elements
- Alt text on images (coming in Task 3)

## Success Criteria

- [ ] All 7 files created (layout.tsx, page.tsx, 3 components, config, CSS)
- [ ] No TypeScript errors (verifies with `npm run type-check`)
- [ ] Root layout renders with valid HTML structure
- [ ] Landing page has all 5 sections (hero, quick links, content grid, video, CTA)
- [ ] Sidebar reads from Task 1's docs.ts and renders navigation
- [ ] Active page highlighted in sidebar
- [ ] Dark mode works (no flashing, proper color scheme)
- [ ] Responsive on mobile/tablet/desktop
- [ ] No unresolved imports or broken links
- [ ] Ready for Task 3 (MDX rendering layer)

## Self-Review Before Committing

- [ ] No TypeScript errors: `npm run type-check`
- [ ] No unused imports or variables
- [ ] All tailwind classes are valid (check docs if unsure)
- [ ] All links point to correct paths (/docs/*, /api/*, /)
- [ ] Header, Sidebar, Footer render without errors
- [ ] Landing page displays all sections correctly
- [ ] Docs layout shows sidebar + main content side-by-side (desktop) or stacked (mobile)
- [ ] Logo/branding consistent (blue square + "LFIQ Onboarding" text)
- [ ] Font rendering (Inter from Google Fonts)
- [ ] Color palette (gray + blue + accents, light and dark)
