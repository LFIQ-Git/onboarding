# Architecture Overview

Complete system architecture for the LFIQ platform, including the BRICK family of applications, data topology, deployment infrastructure, and auth model.

## The BRICK Family (8 Applications)

| App | Purpose | Tech | Users |
|-----|---------|------|-------|
| **Hub** | Entry point, document index, Brick chat interface | Next.js 15, React 19, Clerk, Cloud Run | Everyone |
| **Intel** | Data convergence, observation inbox, property insights | Next.js 15, Auth.js, Neon, GraphQL | Analysts, Operators |
| **Command** | Portfolio management, properties, leasing, maintenance, collections, risk | Next.js 15 monorepo, Auth.js, Neon Auth, Fly backend | Operators, Asset Managers |
| **Keystone** | Personal knowledge management, daily briefing, automation | Next.js 15, Python (launchd + Cloud Run), Neon | Everyone (personal) |
| **Registry** | Deal tracking, opportunities, activities, CRM | Next.js 15, Clerk, Neon | Deal team |
| **Stacks** | SF sourcing pipeline, property dossier, PropertyRadar integration | Next.js 15, React 19, Clerk, Neon | Acquisitions |
| **Sticks** | Personal AI assistant | Next.js 15, Clerk, Cloud Run | Everyone |
| **leftfieldiq.com** | Product marketing, investor materials, public website | Next.js 15, MDX | Public |

## One Database Architecture

All LFIQ applications share a **single Neon database** (PostgreSQL). Data is organized by schema, not by separate databases.

**Neon Project Details:**
- **Endpoint:** ep-tiny-lab-akrddwgy.us-west-2.neon.tech
- **Database:** neondb
- **Region:** us-west-2
- **Backup:** Neon Autoscaling + daily snapshots

**10 Schemas:**

| Schema | Purpose | Approx. Rows | Owned By |
|--------|---------|--------------|----------|
| `portfolio` | Properties, units, rents, leases, valuations | 50,000 | Command |
| `items` | Observations, inbox, tasks, knowledge graph | 100,000 | Intel |
| `gdm` | Power BI Golden Data Model extract (Power BI import) | 500,000 | gdm_extractor (Cloud Run) |
| `market` | Leasing comps, competitor data, rent trends | 200,000 | market_scraper (Cloud Run) |
| `registry` | Deals, opportunities, activities, contacts | 10,000 | Registry |
| `stacks` | SF sourcing pipeline, dossier, PropertyRadar data | 5,000 | Stacks |
| `collect` | Collections, delinquency, resident interactions | 30,000 | Command/Collections |
| `repair` | Work orders, technicians, maintenance costs | 100,000 | Command/Repair |
| `public` | PKM (daily briefing, tasks, automation state) | 20,000 | Keystone |
| `semantic` | Vector embeddings for search and discovery | 50,000 | Intel (Pinecone sync) |

**Per-App Database Roles (least privilege):**
- `intel` — SELECT/INSERT on items, market (ingest); SELECT on portfolio, gdm
- `command` — SELECT/INSERT/UPDATE on portfolio, collect, repair; SELECT on items, market
- `pkm` — SELECT/INSERT/UPDATE on public
- `gdm_extractor` — SELECT/INSERT/UPDATE on gdm
- `market_scraper` — SELECT/INSERT/UPDATE on market
- `neondb_owner` — DDL migrations only

## Deployment Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / CLIENT                               │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS
┌─────────────────────────────▼────────────────────────────────────────────┐
│                       VERCEL (Edge CDN)                                   │
│  Projects: Hub, Intel, Command, Keystone, Registry, Stacks, Sticks      │
│  Auth: Clerk (accounts.lfiq.app) OAuth redirect                         │
└────┬───────────────┬──────────────┬──────────────┬──────────────────────┘
     │               │              │              │
     │ Next.js Apps  │ API Routes   │ Static Assets│
     │ (SSR/SSG)     │ (Serverless) │ (cached)     │
     │               │              │              │
┌────▼───────────────▼──────────────▼──────────────▼──────────────────────┐
│              COMPUTE LAYER                                               │
│  ┌──────────────────────┐    ┌──────────────────────┐                   │
│  │   Fly.io             │    │   GCP Cloud Run      │                   │
│  │   brickston-backend  │    │   Multiple jobs:     │                   │
│  │   (Neon proxy,       │    │   - gdm-extractor    │                   │
│  │    Command API,      │    │   - insight-tagger   │                   │
│  │    GraphQL)          │    │   - hub-chat-proxy   │                   │
│  │                      │    │   - brick-mcp-server │                   │
│  └──────────────────────┘    │   - graph reporter   │                   │
│                              └──────────────────────┘                   │
└───────────────┬──────────────────────┬─────────────────────────────────┘
                │                      │
                │ Neon Protocol        │ SQL
                │                      │
┌───────────────▼──────────────────────▼─────────────────────────────────┐
│              NEON DATABASE (POSTGRES)                                   │
│              ep-tiny-lab-akrddwgy.us-west-2.neon.tech                 │
│              ┌─────────────────────────────────────────────────────┐  │
│              │  neondb (10 schemas)                                 │  │
│              │  - portfolio    - items       - gdm                  │  │
│              │  - market       - registry    - stacks               │  │
│              │  - collect      - repair      - public               │  │
│              │  - semantic (embeddings)                             │  │
│              └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│         EXTERNAL DATA SOURCES (14 inbound integrations)                │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Microsoft 365        │  │ Granola              │                  │
│  │ - Outlook calendar   │  │ - Meeting transcripts│                  │
│  │ - SharePoint reports │  │                      │                  │
│  │ - Teams              │  │                      │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Smartsheet           │  │ PropertyRadar        │                  │
│  │ - Task tracking      │  │ - SF property data   │                  │
│  │ - Projects           │  │ - Distress scores    │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ DataTree             │  │ SF Open Data         │                  │
│  │ - Property records   │  │ - SF Assessor (APN)  │                  │
│  │ - Liens              │  │ - SF Rent Board      │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Power BI / Reports   │  │ Pinecone (Vector DB) │                  │
│  │ - Costumer Golden DM │  │ - Embeddings for RAG │                  │
│  │ - Daily exports      │  │                      │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Box / Dropbox / GDrive│ │ Anthropic API        │                  │
│  │ - Document uploads   │  │ - Claude models      │                  │
│  │ - Shared files       │  │ - Chat, embeddings   │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                  │
│  │ Cartesia             │  │ Cloudflare           │                  │
│  │ - AI voice synthesis │  │ - Email workers      │                  │
│  │                      │  │ - DNS / CDN          │                  │
│  └──────────────────────┘  └──────────────────────┘                  │
└────────────────────────────────────────────────────────────────────────┘
```

## Authentication Model

| App | Provider | Gating | Notes |
|-----|----------|--------|-------|
| **Hub** | Clerk | Cloud Run IAM (OIDC proxy) | Public splash, login required for features |
| **Intel** | Auth.js | Database RLS per user | Requires clerk_user_id in session |
| **Command** | Neon Auth + Auth.js | Database RLS per role | Roles mapped from org membership |
| **Keystone** | Auth.js | PKM MCP bearer token | Token from Keystone environment |
| **Registry** | Clerk | Database RLS per org | Org-level access control |
| **Stacks** | Clerk | Database RLS per user | User-scoped property dossier |
| **Sticks** | Clerk | Cloud Run IAM (OIDC proxy) | Personal assistant |
| **leftfieldiq.com** | None | Public | Open to internet |

**Shared OAuth Broker:**  
All Clerk-authenticated apps redirect through https://accounts.lfiq.app (Clerk tenant `lfiq-cloud`). Single sign-on: log in once, authenticated to all apps.

## External Data Sources (14 Integrations)

### Synchronous APIs (on-demand)
- **Google OAuth** — Clerk social login (Google, Microsoft accounts)
- **Anthropic API** — Claude chat, embeddings for Brick chat
- **Cartesia** — Voice synthesis for alert notifications
- **Cloudflare Email Workers** — Inbound deal forwarding

### Scheduled Ingest Pipelines (Cloud Run, Fly.io, or launchd)
1. **Microsoft 365** (daily) — Calendar, SharePoint reports, Teams presence
2. **Granola** (daily) — Meeting transcripts and insights
3. **Smartsheet** (nightly) — Task tracking, project data
4. **PropertyRadar** (weekly) — SF property comps, distress data
5. **DataTree** (weekly) — Property records, liens
6. **SF DataSF** (nightly) — Assessor parcel records, civic data
7. **SF Rent Board** (monthly) — Rent history, controlled rents
8. **Power BI** (daily 18:30 UTC) — Golden Data Model export to gdm schema
9. **Box / Dropbox / Google Drive** (on-demand) — Document indexing
10. **Pinecone** (real-time) — Vector sync for RAG and semantic search
11. **Vercel Analytics** (real-time) — Web analytics and performance metrics
12. **GitHub** (real-time) — CI/CD, pull requests, deployments
13. **Fly.io** (real-time) — brickston-backend logs and metrics
14. **GCP Secret Manager** (on-app-start) — API keys, database credentials

## Key Infrastructure Facts

### Database Connection Pooling
- **Neon Serverless Driver** (postgres-js) — Vercel, Fly.io, Cloud Run
- **Local proxy port 5433** — gcloud Cloud SQL proxy for development
- **Connection string format:** `postgresql://user:password@host/dbname?sslmode=require`

### Secrets Management
- **Neon roles** — per-app, password-based (rotated quarterly)
- **GCP Secret Manager** — API keys, Clerk secrets, Anthropic tokens
- **Vercel Environment** — linked to git branches, auto-injected at build time
- **Local .env.local** — development only, git-ignored

### Observability
- **Vercel Analytics** — Web performance, deployment metrics
- **GCP Cloud Logging** — Cloud Run jobs, Cloud Scheduler
- **Fly.io Logs** — brickston-backend application logs
- **Browser DevTools** — Client-side errors, network traces

### Build & Deployment Pipeline
- **Git** — Single source of truth (GitHub, LFIQ-Git org)
- **Vercel** — Automatic deployments on push to main; preview deploys on PRs
- **Fly.io** — Manual `fly deploy` for brickston-backend after git push
- **Cloud Run** — Manual `gcloud run deploy` or scheduled Cloud Build triggers
- **CI Gates** — GitHub Actions: linting, type-checking, test suite before merge

## Data Flow: One Observation to Dashboard

Example: New Smartsheet task → Intel observation → Command inbox item → dashboard alert

1. **Smartsheet nightly sync** (Cloud Run job)
   - Fetches new tasks from Smartsheet API
   - Inserts into `items.inbox_items` with `source='smartsheet'`

2. **Intel ingest processor** (Cloud Run job)
   - Polls inbox_items for new observations
   - Enriches with knowledge graph edges
   - Triggers Brick chat notification

3. **Command refresh** (Vercel API + TanStack Query)
   - Command inbox subscription updates
   - Displays observation in `/inbox`
   - User acknowledges or creates task

4. **Keystone briefing** (next morning)
   - Daily briefing queries items for user email
   - Renders markdown summary in `public.daily_briefing`

This flow ensures data fidelity, traceability, and single-source-of-truth through the Neon database.
