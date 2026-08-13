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
- Daily briefing
- Task list (database-backed)
- Automation runner (on-demand, invoked through the MCP server)
- Connectors UI (OAuth token management)
- Metrics dashboard

## Deployment

| Environment | URL | Status | Platform |
|-------------|-----|--------|----------|
| **Production** | https://keystone.lfiq.app | Live | Vercel |
| **Preview** | https://keystone-branch.lfiq.app | Auto-deploy on PR | Vercel |
| **Local Dev** | http://localhost:3003 | Via `npm run dev` | Local machine |
| **MCP Server** | https://keystone-mcp.lfiq.app | Fly app `pkm-mcp` | Remote |

## Tech Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **Frontend** | Next.js 15 | React 19, dashboard, task UI |
| **Language** | TypeScript | Full type coverage |
| **Auth** | Clerk | `sessionClaims.apps` gate in `middleware.ts` |
| **Database** | Neon (public schema) | Tasks, daily briefing, automation state |
| **Backend** | Python | ETL, briefing generation, automation scripts |
| **MCP Server** | Python on Fly (`pkm-mcp`) | Provides pkm_* tools |
| **Secrets** | Vercel environment, Fly app secrets, macOS Keychain | OAuth tokens, API keys |
| **Deployment** | Vercel (frontend), `flyctl deploy` (MCP server) | Vercel auto-deploys on main |

## Local Development

### Start the Frontend

```bash
cd /path/to/02-brick.apps/apps/keystone
npm run dev
# Runs on http://localhost:3003
```

### Start the Backend (Python Automation)

Keystone's backend is a set of Python automation scripts under `automation/`. They are no longer on a local schedule.

**The local launchd fleet is retired.** All 16 `com.justinsato.*` jobs were unloaded and removed on 2026-06-23, and the plist templates were moved to `automation/launchd/retired/`. The installer refuses to run. `launchctl list` shows zero `com.justinsato.*` entries. Do not reinstate a launchd job to fix a stale feed; that was an intentional decision, not a regression.

Run a script directly:
```bash
cd /path/to/02-brick.apps/02-brick.keystone
.venv/bin/python automation/scripts/<script>.py
```

The keystone root has two virtualenvs and they are not interchangeable. `.venv` is Python 3.13 and was the launchd venv. `venv` is Python 3.14 and is what the MCP entry point runs. Both are live for different consumers.

Scheduled agent work now lives in the MCP scheduled-tasks scheduler (`~/.claude/scheduled-tasks/`) and in the Cowork registry. A task belongs to exactly one of the two. Registering it in both double-fires it.

### Environment Variables

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Yes | Neon connection (public schema, pkm role) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key. `BRICK_CLERK_PUBLISHABLE_KEY` is the fallback name |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key. `BRICK_CLERK_SECRET_KEY` is the fallback name |
| `BRICK_AUTH_DISABLED` | No | Local dev only. Set `true` to bypass the Clerk gate |
| `ANTHROPIC_API_KEY` | Yes | Claude for briefing generation |
| `PKM_DASHBOARD_URL` | Yes | Base URL the MCP server posts to for `/api/refresh` |
| `PKM_PUBLIC_UI_ORIGIN` | No | Public origin used in generated links |

On the Fly app `pkm-mcp`, three settings do not survive a bare redeploy and have to be re-set, or `/oauth/token` returns a 500:

| Setting | Purpose |
|---------|---------|
| `PKM_MCP_OAUTH_CLIENT_ID` | Client credentials shim |
| `PKM_MCP_OAUTH_CLIENT_SECRET` | Client credentials shim |
| `PKM_MCP_PUBLIC_URL` | Must be the `https://` URL. If unset, the discovery document advertises `http://`, the client's POST gets downgraded to GET on the redirect, and you see a misleading 405 |

Pull from Vercel:
```bash
vercel env pull
```

## Daily Briefing Generation

The written briefing lands in the `public.daily_briefing` table. Read [Daily Briefing](/docs/daily-briefing) before relying on its freshness: the local 06:00 producer was retired with the rest of the launchd fleet and there is no confirmed replacement schedule for the written briefing. The three audio and public briefing jobs do run, on Fly `brick-cron`.

The briefing includes:
- Portfolio overview (occupancy, rent, revenue)
- Market movements (rent trends, competitor activity)
- Observations from Intel (high-priority items)
- Lease expirations (next 30 days)
- Maintenance summary (recent work orders)
- Task summary (overdue and due-today items)

**Briefing location:** the `public.daily_briefing` table in Neon. Markdown copies under the PKM daily folder are a disposable projection of that table, not the record.

### How Briefing is Generated

1. **Invoked on demand** through the MCP automation runner, which whitelists the script. The Fly `brick-cron` crontab carries the audio and public briefing labels but not the written one.

2. **Python script** runs queries against Neon:
   - Properties and occupancy (portfolio schema)
   - Recent observations (items schema)
   - Market trends (market schema)
   - Tasks (public schema)

3. **Claude enrichment** (optional):
   - Observations are summarized by Claude
   - Insights are generated (risk alerts, opportunities)
   - Markdown is formatted with headers and tables

4. **Row written** to the `public.daily_briefing` table

5. **Surfaced** on the Keystone dashboard and through the `pkm_get_briefing` MCP tool

## Key Flows

### Flow 1: Generate Daily Briefing
1. An operator or agent invokes the generator through the MCP automation runner
2. Python script queries Neon: properties, leases, observations, tasks
3. Markdown template is rendered with data
4. Claude API enriches insights (optional)
5. Markdown saved to the public.daily_briefing table
6. Dashboard and MCP tools read the new row

### Flow 2: Create Task (via Frontend)
1. User opens keystone.lfiq.app/tasks
2. User clicks "New Task"
3. Form: title, description, due date, priority
4. Submit → INSERT into public.tasks
5. Task appears in task list and daily briefing
6. If due today, notification sent

### Flow 3: Run Automation Script
1. An operator or agent triggers the automation through the MCP `pkm_run_automation` tool, or runs the script directly:
   ```bash
   .venv/bin/python automation/scripts/<script>.py
   ```

2. Python script runs (ETL, data enrichment, etc.)
3. Results logged to the automation log directory
4. Output saved to Neon or an external service
5. Errors surface in `public.agent_feed`, which Keystone shows as unread

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
cd /path/to/02-brick.apps/02-brick.keystone

# Install Python dependencies into the 3.13 venv
.venv/bin/pip install -r automation/requirements.txt

# Run a script. Environment comes from .env.local, which vercel env pull creates
.venv/bin/python automation/jobs/briefing_generator.py
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

- **Production:** https://keystone-mcp.lfiq.app, served by the Fly app `pkm-mcp` (org brickston, region sjc)
- **Source:** `02-brick.keystone/automation/mcp_server.py`
- Note: `pkm-mcp` and the suspended `pkm-mcp-server` are different apps. Only `pkm-mcp` serves the live host.

## Troubleshooting

### Issue 1: "Daily briefing is stale"
**Symptom:** The briefing on the dashboard is days old  
**Cause:** Expected. The scheduled local producer was retired on 2026-06-23 and no replacement schedule for the written briefing has been confirmed  
**Fix:**
```bash
# Check what the table actually holds
psql "$DATABASE_URL" -c \
  "SELECT briefing_date, length(content) FROM public.daily_briefing ORDER BY briefing_date DESC LIMIT 5;"

# Generate one on demand
.venv/bin/python automation/jobs/briefing_generator.py
```
Do not reinstate a launchd job to fix this. See [Daily Briefing](/docs/daily-briefing).

### Issue 2: "Connector data is stale"
**Symptom:** M365 or another connected account stops producing rows  
**Cause:** The OAuth token expired. Keystone brokers the tokens, Intel's `connections-pull` cron does the fetching  
**Fix:**
```bash
# Re-authorize in the UI
# Visit keystone.lfiq.app/connectors and reconnect the account

# Then re-run the pull from the Intel side
curl "https://intel.lfiq.app/api/cron/connections-pull?secret=$INGEST_SECRET"
```

### Issue 3: "MCP server returns 500 or a 405 on /oauth/token"
**Symptom:** Claude Code cannot connect to the pkm_* tools  
**Cause:** A redeploy of the Fly app `pkm-mcp` dropped the three OAuth settings listed above  
**Fix:**
```bash
flyctl status -a pkm-mcp
flyctl secrets list -a pkm-mcp

# Re-set the three that do not survive a redeploy (names only, values from the menubar config)
flyctl secrets set PKM_MCP_OAUTH_CLIENT_ID=... PKM_MCP_OAUTH_CLIENT_SECRET=... \
  PKM_MCP_PUBLIC_URL=https://keystone-mcp.lfiq.app -a pkm-mcp
```
A `400 Missing session ID` from `/mcp` is normal protocol behavior without an `initialize` handshake, not an auth failure.

### Issue 4: "Database role 'pkm' sees zero rows and no error"
**Symptom:** A query returns nothing, with no permission error  
**Cause:** Row-Level Security. Several `public.*` tables have RLS enabled, and a grant alone is not enough. Each role needs its own policy  
**Fix:**
```sql
-- Apply as neondb_owner, not through the app-role migration runner
CREATE POLICY pkm_all ON public.<table> FOR ALL TO pkm USING (true) WITH CHECK (true);
```

## Common Tasks

### Task 1: Generate Briefing On-Demand
```bash
cd /path/to/02-brick.apps/02-brick.keystone
.venv/bin/python automation/jobs/briefing_generator.py
```

### Task 2: Query Task List
```sql
SELECT id, title, due_date, status, priority
FROM public.tasks
WHERE status = 'open' AND due_date <= now() + interval '7 days'
ORDER BY due_date ASC;
```

### Task 3: Refresh Connected M365 Data
The M365 pull runs on the Intel side, not from Keystone. Keystone brokers the OAuth token; Intel's `connections-pull` cron does the fetching.

```bash
curl "https://intel.lfiq.app/api/cron/connections-pull?secret=$INGEST_SECRET"
```

## Related Documentation

- **Architecture:** PKM data topology, MCP server, daily briefing workflow
- **Getting Started:** Setup, Logins, Install Tools
- **Brick MCP:** Using pkm_* tools in Claude Code
- [Daily Briefing](/docs/daily-briefing)
- [Fly.io Backend](/docs/fly-io-backend)
