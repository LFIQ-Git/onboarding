# Task 1: Create Documentation Structure & Cheat Sheet

## Overview
Create the foundational markdown content files that will power the onboarding manual. This includes:
- One-page cheat sheet (quick reference for URLs, secrets, setup)
- Architecture overview
- Getting started guides (setup, logins, tool installation)
- Per-app guides (8 major LFIQ applications)
- Troubleshooting guides

## Files to Create

**Documentation content files:**
- `src/content/cheat-sheet.md` — One-page quick reference with URLs, secrets checklist, local setup steps, troubleshooting
- `src/content/architecture.md` — BRICK family overview, data architecture diagram (ASCII), deployment topology, auth model, external data sources
- `src/content/getting-started/setup.md` — Step-by-step local dev setup (clone, install, secrets, verify)
- `src/content/getting-started/logins.md` — Clerk auth, Neon database, Google OAuth, GCP SA, GitHub CLI, Fly.io
- `src/content/getting-started/install.md` — Claude Code desktop agent, GitHub CLI, Node/Python managers (mise), Vercel, Flyctl, Docker
- `src/content/apps/hub.md` — Hub app guide (what it does, deployment, tech stack, local dev, env vars, login flow, chat proxy, troubleshooting, common tasks)
- `src/content/apps/intel.md` — Similar structure for Intel (data ingestion, 14 sources, env vars)
- `src/content/apps/command.md` — Command guide (portfolio management, tech stack, Fly backend, Cloud Run jobs)
- `src/content/apps/keystone.md` — Keystone guide (PKM, Python automation, local daemon)
- `src/content/apps/registry.md` — Registry guide (deal tracking)
- `src/content/apps/stacks.md` — Stacks guide (SF sourcing pipeline)
- `src/content/apps/sticks.md` — Sticks guide (personal AI)
- `src/content/apps/leftfieldiq-site.md` — Site guide (product marketing page)

**Utilities:**
- `src/lib/docs.ts` — Documentation tree metadata with titles, slugs, paths for sidebar navigation

## Content Requirements

### Cheat Sheet (`src/content/cheat-sheet.md`)
**Must include:**
- Critical URLs table (Hub, Intel, Command, Keystone, Registry, Stacks, Sticks)
- Database & Secrets section (Neon endpoint, Clerk, Vercel, Fly)
- Local Setup (60 seconds: cd, mise install, npm ci, vercel link, npm run dev)
- Key Logins (Clerk keys, Neon DSN, Anthropic, GitHub)
- Troubleshooting (3 most common: env vars, Neon cold start, Clerk claims)
- Learning Path (5 steps: read arch, do setup, watch Hub video, explore Intel, deploy PR)

### Architecture (`src/content/architecture.md`)
**Must include:**
- BRICK Family: 8 apps with one-sentence purpose each
- One Database section: Neon endpoint, all 10 schemas, row counts, purposes
- Deployment Topology: ASCII diagram showing Vercel → Fly → GCP Cloud Run → Neon
- Auth Model: table with App, Provider, Gating method, Notes
- External Data Sources: 14 sources (M365, Granola, Smartsheet, PropertyRadar, DataTree, SF DataSF, SF Rent Board, Power BI, Pinecone, Box, Dropbox/Drive, Anthropic, Cartesia, Cloudflare)

### Getting Started: Setup (`src/content/getting-started/setup.md`)
**Must include:**
- Prerequisites (macOS, Git, GitHub CLI, Node 20, Python 3.11, Vercel, Docker optional)
- Step 1: Clone & Install (with exact commands, mise install, npm ci)
- Step 2: Pull Secrets from GCP (gcloud auth, create ~/.pkm, pull intel-neon-*, items-hub-*, command-database-url-direct)
- Step 3: Link to Vercel (vercel link, vercel env pull)
- Step 4: Verify Local Dev (npm run dev, curl health check)
- Step 5: Set up other apps (repeat for hub, command, keystone, registry, stacks, sticks)
- Troubleshooting (5 common errors with fixes)

### Per-App Guides
**Each app guide must include (example: hub.md):**
- What It Does (one paragraph)
- Deployment (table: Env, URL, Status)
- Tech Stack (framework, auth, backend, database, deployment platform)
- Local Development (exact commands to start)
- Environment Variables (table: Var, Required?, Default, Purpose)
- Key Flows (numbered list with 2-3 major workflows)
- Troubleshooting (3-5 common issues with fixes)
- Common Tasks (3 tasks with code examples)

### Docs Navigation Tree (`src/lib/docs.ts`)
**Must export:**
```typescript
export const docNav = [
  {
    title: 'Getting Started',
    items: [
      { href: '/docs/getting-started', label: 'Overview' },
      { href: '/docs/getting-started/setup', label: 'Local Setup' },
      { href: '/docs/getting-started/logins', label: 'Logins & Auth' },
      { href: '/docs/getting-started/install', label: 'Install Tools' },
    ],
  },
  // ... repeat for Architecture, Apps (8 items), Workflows, Troubleshooting, Reference
]
```

## Global Constraints

- **No GCS references** — All cloud infrastructure is Vercel, Fly, GCP Cloud Run, Neon
- **No Obsidian references** — PKM is cloud-based via Keystone
- **Current info only** — All URLs and deployments from 2026-08-11 LFIQ scout report (shared with agent as context)
- **Copy style** — Plain operator voice, no jargon, institutional quality
- **No secrets in docs** — No API keys, passwords, internal IPs in any public content
- **Exact commands** — Every bash/shell command must be copy-paste ready and tested mentally for accuracy

## Success Criteria

- [ ] All 12 markdown content files created in `src/content/`
- [ ] No "TODO", "TBD", or placeholder text
- [ ] All setup steps have actual bash commands
- [ ] All app guides follow consistent structure
- [ ] Docs navigation tree in `src/lib/docs.ts` has 30+ entries across 6 sections
- [ ] Cheat sheet is genuinely useful as one-page reference
- [ ] Ready for Task 2 (web app will render these files)

## Self-Review Before Committing

- [ ] Every code block is copy-paste ready (no pseudo-code)
- [ ] No file paths contain personal folders (/Volumes/satopkm/justinsato)
- [ ] All URLs use correct domains (.lfiq.app, exact endpoints from scout report)
- [ ] All bash commands tested for syntax
- [ ] Cheat sheet + arch overview together tell new engineer the full picture in 15 minutes
- [ ] Consistent capitalization: Hub (not hub), Intel (not intel), LFIQ (not lfiq)
- [ ] No "to be determined", "implementation detail", or "similar to Task X" phrases
