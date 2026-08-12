# Keystone App Guide

Keystone is the personal knowledge management (PKM) system for LFIQ. It provides daily briefings, task management, automation orchestration, and a dashboard for personal workflows.

## What It Does

Keystone is a personal operating system for knowledge workers:
- **Daily briefing:** Auto-generated daily summary of portfolio activity, market movements, and observations
- **Tasks:** Personal task management, synced across devices
- **Automation:** Python scripts for ETL, data enrichment, and integrations
- **Dashboard:** Real-time metrics, portfolio summary, market pulse
- **Connections:** OAuth connectors to M365, Slack, GitHub, Pinecone, and other services
- **MCP server:** Provides brick_* tools for Claude Code and Anthropic agents

**Primary features:**
- Daily briefing markdown (regenerated each morning)
- Task list (database-backed)
- Automation runner (local launchd + Cloud Run)
- Connectors UI (OAuth token management)
- Metrics dashboard

## Deployment

| Environment | URL | Status | Platform |
|-------------|-----|--------|----------|
| **Production** | https://keystone.lfiq.app | Live | Vercel |
| **Preview** | https://keystone-branch.lfiq.app | Auto-deploy on PR | Vercel |
| **Local Dev** | http://localhost:3003 | Via `npm run dev` | Local machine |
| **MCP Server** | keystone-mcp.lfiq.app:3457 | Cloud Run | Remote |

## Tech Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **Frontend** | Next.js 15 | React 19, dashboard, task UI |
| **Language** | TypeScript | Full type coverage |
| **Auth** | Auth.js | Session-based, database RLS |
| **Database** | Neon (public schema) | Tasks, daily briefing, automation state |
| **Backend** | Python (launchd + Cloud Run) | ETL, briefing generation, automation |
| **MCP Server** | Python (Fly.io or Cloud Run) | Provides brick_* tools |
| **Secrets** | Keychain + GCP Secret Manager | OAuth tokens, API keys |
| **Deployment** | Vercel (frontend) + Cloud Run (backend) | Auto-deploy on main |

## Local Development

### Start the Frontend

```bash
cd /path/to/02-brick.apps/apps/keystone
npm run dev
# Runs on http://localhost:3003
```

### Start the Backend (Python Automation)

Keystone's backend runs Python automation scripts. There are two ways to run them:

#### Option 1: Local launchd (for scheduled jobs)
```bash
# Automation scripts are managed by launchd plists
# View current automation jobs:
launchctl list | grep pkm

# Start automation daemon
launchctl load ~/Library/LaunchAgents/com.leftfieldinv.keystone-automation.plist

# View logs
tail -f ~/Library/Logs/keystone-automation.log
```

#### Option 2: Cloud Run (for testing)
```bash
# Deploy Python automation to Cloud Run
gcloud run deploy keystone-automation \
  --source=/path/to/02-brick.apps/apps/keystone \
  --runtime=python311 \
  --project=brickston-v2

# Invoke manually
gcloud run jobs execute keystone-automation --project=brickston-v2
```

### Environment Variables

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Yes | Neon connection (public schema, pkm role) |
| `NEXTAUTH_SECRET` | Yes | Session encryption |
| `ANTHROPIC_API_KEY` | Yes | Claude for briefing generation |
| `PINECONE_API_KEY` | No | For embeddings and search |
| `M365_CLIENT_ID` | No | Microsoft OAuth |
| `M365_CLIENT_SECRET` | No | Microsoft OAuth secret |
| `SLACK_BOT_TOKEN` | No | Slack notifications |
| `GITHUB_TOKEN` | No | GitHub API access |
| `PKM_AUTOMATION_SECRET` | Yes | Shared secret for automation requests |

Pull from Vercel:
```bash
vercel env pull
```

## Daily Briefing Generation

Each morning (usually 6 AM PT), Keystone generates a daily briefing markdown file. The briefing includes:
- Portfolio overview (occupancy, rent, revenue)
- Market movements (rent trends, competitor activity)
- Observations from Intel (high-priority items)
- Lease expirations (next 30 days)
- Maintenance summary (recent work orders)
- Task summary (overdue and due-today items)

**Briefing location:** 
PKM daily folder (organized by date)

Files are named: `briefing-YYYY-MM-DD.md`

### How Briefing is Generated

1. **Automated Cloud Run job** (nightly, 18:00 UTC or on-demand)
   ```bash
   gcloud run jobs execute keystone-briefing-generator --project=brickston-v2
   ```

2. **Python script** runs queries against Neon:
   - Properties and occupancy (portfolio schema)
   - Recent observations (items schema)
   - Market trends (market schema)
   - Tasks (public schema)

3. **Claude enrichment** (optional):
   - Observations are summarized by Claude
   - Insights are generated (risk alerts, opportunities)
   - Markdown is formatted with headers and tables

4. **File saved** to `public.daily_briefing` table

5. **Notification sent** (Slack, iMessage, email) with link to briefing

## Key Flows

### Flow 1: Generate Daily Briefing
1. Cloud Run job (keystone-briefing-generator) triggers at scheduled time
2. Python script queries Neon: properties, leases, observations, tasks
3. Markdown template is rendered with data
4. Claude API enriches insights (optional)
5. Markdown saved to public.daily_briefing table
6. User notified via Slack or iMessage with link to briefing

### Flow 2: Create Task (via Frontend)
1. User opens keystone.lfiq.app/tasks
2. User clicks "New Task"
3. Form: title, description, due date, priority
4. Submit → INSERT into public.tasks
5. Task appears in task list and daily briefing
6. If due today, notification sent

### Flow 3: Run Automation Script
1. User or schedule triggers automation:
   ```bash
   # Via launchd (automatic)
   # Or manual trigger:
   gcloud run jobs execute my-automation-job --project=brickston-v2
   ```

2. Python script runs (ETL, data enrichment, etc.)
3. Results logged to Cloud Logging
4. Output saved to database or external service
5. Notification sent if errors occur

## Automation Scripts

Keystone's automation directory contains reusable Python scripts:

```
apps/keystone/automation/
├── jobs/
│   ├── briefing_generator.py       # Daily briefing
│   ├── task_syncer.py              # M365 task sync
│   ├── property_enricher.py        # Enrich properties with market data
│   └── ...
├── connectors/
│   ├── m365.py                     # Microsoft Graph API
│   ├── slack.py                    # Slack notifications
│   ├── pinecone.py                 # Vector embeddings
│   └── ...
├── mcp_server.py                   # Anthropic MCP server
└── requirements.txt                # Python dependencies
```

### Running an Automation Script Locally

```bash
# Install Python dependencies
cd /path/to/02-brick.apps/apps/keystone
pip install -r automation/requirements.txt

# Run a script
python automation/jobs/briefing_generator.py

# Or with environment variables (from GCP secrets)
export DATABASE_URL=$(gcloud secrets versions access latest --secret=items-hub-database-url --project=brickston-v2)
export ANTHROPIC_API_KEY=$(gcloud secrets versions access latest --secret=anthropic-api-key --project=brickston-v2)
python automation/jobs/briefing_generator.py
```

## MCP Server (keystone-mcp)

Keystone provides an MCP server that exposes brick_* tools for Claude Code and Anthropic agents. This allows agents to:
- Query tasks and projects
- Create and update tasks
- Query portfolio data
- Access briefing data
- Run automations

### Accessing MCP Tools

In Claude Code or an agent:
```
/brick pkm_get_dashboard_state
```

This calls the Keystone MCP server and returns current PKM state.

### Server Location

- **Production:** keystone-mcp.lfiq.app (Fly.io)
- **Local dev:** localhost:3457 (if running locally)

## Troubleshooting

### Issue 1: "Daily briefing not generated"
**Symptom:** Briefing folder is empty or very old  
**Cause:** Cloud Run job failed, Neon query error, or schedule not running  
**Fix:**
```bash
# Check job status
gcloud run jobs describe keystone-briefing-generator --project=brickston-v2

# View recent logs
gcloud run logs read keystone-briefing-generator \
  --project=brickston-v2 --limit=50

# Manually trigger
gcloud run jobs execute keystone-briefing-generator --project=brickston-v2
```

### Issue 2: "Tasks not syncing from M365"
**Symptom:** New M365 tasks don't appear in Keystone  
**Cause:** M365 OAuth token expired or task_syncer job failed  
**Fix:**
```bash
# Re-authenticate M365
# Visit keystone.lfiq.app/connectors
# Click "Reconnect" on Microsoft 365
# Authorize in browser

# Then manually run syncer
gcloud run jobs execute keystone-task-syncer --project=brickston-v2
```

### Issue 3: "MCP server returns 'connection refused'"
**Symptom:** Claude Code can't connect to brick_* tools  
**Cause:** keystone-mcp.lfiq.app is down or unreachable  
**Fix:**
```bash
# Check service status
gcloud run services describe keystone-mcp --project=brickston-v2

# Check if service is running
curl https://keystone-mcp.lfiq.app/health

# Redeploy if needed
cd /path/to/02-brick.apps/apps/keystone
gcloud run deploy keystone-mcp \
  --source=. --runtime=python311 --project=brickston-v2
```

### Issue 4: "Database role 'pkm' has no permissions"
**Symptom:** 403 error when creating tasks  
**Cause:** User role doesn't have write access to public schema  
**Fix:**
```bash
# Verify pkm role permissions
psql -U neondb_owner -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech neondb \
  -c "GRANT SELECT, INSERT, UPDATE ON public.tasks TO pkm;"

# Restart app
npm run dev
```

## Common Tasks

### Task 1: Generate Briefing On-Demand
```bash
gcloud run jobs execute keystone-briefing-generator --project=brickston-v2

# Or from CLI:
./apps/keystone/automation/jobs/briefing_generator.py
```

### Task 2: Query Task List
```sql
SELECT id, title, due_date, status, priority
FROM public.tasks
WHERE status = 'open' AND due_date <= now() + interval '7 days'
ORDER BY due_date ASC;
```

### Task 3: Sync M365 Tasks to Keystone
```bash
# Manual trigger
gcloud run jobs execute keystone-task-syncer --project=brickston-v2

# Or in Python:
python automation/jobs/task_syncer.py
```

## Related Documentation

- **Architecture:** PKM data topology, MCP server, daily briefing workflow
- **Getting Started:** Setup, Logins, Install Tools
- **Brick MCP:** Using brick_* tools in Claude Code
- **Cloud Run:** Job execution, monitoring, logging
