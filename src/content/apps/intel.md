# Intel App Guide

Intel is the data convergence hub for LFIQ. It ingests observations from 14 external sources, enriches them with a knowledge graph, and surfaces them through an inbox interface and semantic search.

## What It Does

Intel aggregates operational intelligence from across the LFIQ ecosystem:
- **Observations inbox:** New data points from M365, Granola, Smartsheet, PropertyRadar, DataTree, SF civic, Rent Board, Power BI, Box, Pinecone, Anthropic, Cartesia, Cloudflare, GitHub
- **Knowledge graph:** Edges linking observations to properties, deals, contacts, and market conditions
- **Semantic search:** Embeddings stored in Pinecone for similarity search across observations
- **Data enrichment:** Automatic linking of related observations, resolution of references
- **Alerts:** Notifications of high-priority observations (delinquency, rent spikes, lease expirations)

**Primary features:**
- Observation inbox (priority-ranked)
- Semantic search
- Knowledge graph browser
- Property override editing (manual data corrections)
- Data accuracy monitoring

## Deployment

| Environment | URL | Status | Platform |
|-------------|-----|--------|----------|
| **Production** | https://intel.lfiq.app | Live, auto-deploy on git push | Vercel |
| **Preview** | https://intel-branch.lfiq.app | Auto-deploy on PR | Vercel |
| **Local Dev** | http://localhost:3001 | Via `npm run dev` | Local machine |

## Tech Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **Framework** | Next.js 15 | React 19, App Router |
| **Language** | TypeScript | Full type coverage |
| **Auth** | Auth.js + Neon Auth | Session-based, database RLS |
| **Database** | Neon (items schema) | 100k+ observations, knowledge graph |
| **Search** | Pinecone | Vector embeddings for semantic search |
| **External APIs** | 14 sources | M365, Granola, Smartsheet, PropertyRadar, etc. |
| **Ingest Pipeline** | Cloud Run jobs | Nightly/hourly sync from each source |
| **Deployment** | Vercel | Auto-deploy on main |

## Local Development

### Start the App

```bash
cd /path/to/02-brick.apps/apps/intel
npm run dev
# Runs on http://localhost:3001
```

### Environment Variables

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Yes | Neon connection (items schema, intel role) |
| `NEXTAUTH_SECRET` | Yes | Session encryption key |
| `NEXTAUTH_URL` | No | Callback URL (defaults to http://localhost:3001) |
| `PINECONE_API_KEY` | No | Vector search (optional for local dev) |
| `ANTHROPIC_API_KEY` | No | Claude for observation enrichment |

Pull from Vercel:
```bash
vercel env pull
```

## Data Sources (14 Integrations)

### Incoming Integration Details

| Source | Frequency | API | Purpose | Status |
|--------|-----------|-----|---------|--------|
| **Microsoft 365** | Daily | Microsoft Graph | Calendar, tasks, presence | Active |
| **Granola** | Daily | REST API | Meeting transcripts, insights | Active |
| **Smartsheet** | Nightly | REST API | Project tracking, tasks | Active |
| **PropertyRadar** | Weekly | REST API | SF comp data, distress scores | Active |
| **DataTree** | Weekly | SFTP | Property records, liens, ownership | Active |
| **SF DataSF** | Nightly | Socrata (REST) | Assessor records, APN, permits | Active |
| **SF Rent Board** | Monthly | Web scrape | Registered rents, appeals | Active |
| **Power BI** | Daily 18:30 UTC | Export → GCP | Golden Data Model | Active |
| **Box** | On-demand | REST API | Document uploads, indexing | Active |
| **Pinecone** | Real-time | gRPC | Vector sync for embeddings | Active |
| **Anthropic** | Real-time | REST API | Observation enrichment via Claude | Active |
| **Cartesia** | On-demand | REST API | Voice synthesis for alerts | Configured |
| **GitHub** | Real-time | Webhooks | Deployment notifications | Active |
| **Cloudflare** | Real-time | Email workers | Inbound forwarding | Active |

### How Ingest Works

1. **Source system** (e.g., Smartsheet API) sends data to a Cloud Run ingest job
2. **Ingest job** validates and transforms data
3. **Insert into `items.inbox_items`** with source, timestamp, payload
4. **Trigger knowledge graph processor** to link observations
5. **Enrich with embeddings** (Pinecone sync)
6. **Send notification** if high priority

Example flow for Smartsheet task:
```
Smartsheet API
  ↓
Cloud Run job (smartsheet-ingest)
  ↓
INSERT INTO items.inbox_items (source, payload)
  ↓
Cloud Run job (knowledge-graph-processor)
  ↓
INSERT INTO items.knowledge_edges (source_id, target_id)
  ↓
POST to Pinecone (create embedding)
  ↓
Brick chat notification (if priority > threshold)
```

## Key Flows

### Flow 1: New Observation Arrives
1. External source sends data (e.g., Smartsheet, M365)
2. Cloud Run ingest job validates and inserts into `items.inbox_items`
3. Knowledge graph processor links observation to properties/deals
4. Embedding generated and stored in Pinecone
5. Intel UI updates via real-time subscription
6. If priority > threshold, Brick chat sends notification

### Flow 2: User Acknowledges Observation
1. User clicks observation in Intel inbox
2. UI toggles `acknowledged` flag in database
3. Observation remains in inbox but marked as read
4. If actionable, user can create task in Command or Registry

### Flow 3: Semantic Search
1. User enters search query in Intel search box
2. Query is embedded using Anthropic embeddings API
3. Pinecone searches for similar observations (top 10 results)
4. Results ranked by similarity and recency
5. UI displays results with snippets and source

## Environment Variables

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `DATABASE_URL` | Yes | — | Neon connection string (intel role) |
| `NEXTAUTH_SECRET` | Yes | — | Session encryption |
| `NEXTAUTH_URL` | No | http://localhost:3001 | OAuth callback URL |
| `PINECONE_API_KEY` | No | — | Vector search API key |
| `PINECONE_INDEX` | No | `lfiq-observations` | Pinecone index name |
| `ANTHROPIC_API_KEY` | No | — | Claude API key (enrichment) |
| `SMARTSHEET_API_KEY` | No | — | Smartsheet OAuth token (ingest) |
| `GRAPH_API_TOKEN` | No | — | Microsoft Graph token (M365) |

## Troubleshooting

### Issue 1: "Observations not appearing in inbox"
**Symptom:** Inbox is empty or stale data from days ago  
**Cause:** Ingest pipeline failed, Neon connection issue, or polling not running  
**Fix:**
```bash
# Check Cloud Run ingest jobs
gcloud run services list --project=brickston-v2

# Check job logs
gcloud run logs read smartsheet-ingest \
  --project=brickston-v2 --limit=50

# Manually trigger ingest job
gcloud run jobs execute smartsheet-ingest \
  --project=brickston-v2
```

### Issue 2: "Database connection timeout on observations query"
**Symptom:** "Observations" page hangs for 40+ seconds  
**Cause:** Neon cold start or slow query  
**Fix:**
```bash
# Warm connection
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech \
  -U intel neondb -c "SELECT 1 FROM items.inbox_items LIMIT 1;"

# Reload page
```

### Issue 3: "Semantic search returns no results"
**Symptom:** Search box works but no results shown  
**Cause:** Pinecone API key missing, index not populated, or embeddings failed  
**Fix:**
```bash
# Verify Pinecone API key
grep PINECONE_API_KEY .env.local

# Check Pinecone index stats
# Log in to Pinecone console at https://app.pinecone.io
# Select project → select index → check vector count

# Re-trigger embedding sync
gcloud run jobs execute pinecone-sync \
  --project=brickston-v2
```

### Issue 4: "Auth fails with 'user not found'"
**Symptom:** 403 error after login, message "User not found in database"  
**Cause:** Auth.js session exists but no user row in database  
**Fix:**
```bash
# User must be provisioned in Neon first
# Contact platform team to add user to items.users table

# Or clear browser cache and retry
# DevTools > Application > Storage > Clear Site Data
```

## Common Tasks

### Task 1: Query Observations Directly
```sql
-- Count observations by source
SELECT source, COUNT(*) 
FROM items.inbox_items 
GROUP BY source
ORDER BY COUNT(*) DESC;

-- Find recent high-priority observations
SELECT id, source, created_at, payload
FROM items.inbox_items
WHERE priority > 7
ORDER BY created_at DESC
LIMIT 20;

-- Search observations by property APN
SELECT *
FROM items.inbox_items
WHERE payload->>'property_apn' = '0123-456-789'
ORDER BY created_at DESC;
```

### Task 2: Trigger a Manual Ingest Job
```bash
# Smartsheet sync (runs nightly by default)
gcloud run jobs execute smartsheet-ingest --project=brickston-v2

# PropertyRadar sync (runs weekly by default)
gcloud run jobs execute propertyradar-ingest --project=brickston-v2

# M365 calendar sync
gcloud run jobs execute m365-ingest --project=brickston-v2
```

### Task 3: Add a New Data Source
To integrate a new external data source into Intel:

1. Create ingest job (Cloud Run)
2. Add source credentials to GCP Secret Manager
3. Write validation logic (transform → items.inbox_items)
4. Add knowledge graph linking
5. Deploy and test with sample data
6. Add to data sources table in docs

See Cloud Run jobs directory in the monorepo for examples.

## Related Documentation

- **Architecture:** System topology, auth model, 14 data sources
- **Getting Started:** Setup, Logins, Install Tools
- **Command:** Portfolio management (Intel feeds into Command inbox)
- **Semantic Search:** Pinecone documentation, embedding models
- **Neon Database:** Connection pooling, schema reference
