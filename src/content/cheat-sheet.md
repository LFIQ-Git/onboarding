# LFIQ Onboarding Cheat Sheet

One-page quick reference for getting productive in the LFIQ stack. Complete your first 60 minutes using the items below.

## Critical URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Hub | https://hub.lfiq.app | Entry point, document index, Brick chat |
| Intel | https://intel.lfiq.app | Data convergence, inbox, observations |
| Command | https://command.lfiq.app | Portfolio management, properties, leasing |
| Keystone | https://keystone.lfiq.app | PKM, daily briefing, automation dashboard |
| Registry | https://registry.lfiq.app | Deal tracking, opportunities, activities |
| Stacks | https://stacks.lfiq.app | SF sourcing pipeline, dossier, PropertyRadar |
| Sticks | https://sticks.lfiq.app | Personal AI assistant |
| Marketing Site | https://leftfieldiq.app | Product overview, investor materials |

## Database & Secrets

| Item | Value/Location | Notes |
|------|--------|-------|
| **Neon Database** | Endpoint: `ep-tiny-lab-akrddwgy.us-west-2.neon.tech` | Schemas: portfolio, items, gdm, market, registry, stacks, collect, repair, public, semantic |
| **Clerk Auth** | https://accounts.lfiq.app | Shared OAuth broker for all apps |
| **GCP Project** | `brickston-v2` (us-west-1) | Cloud Run, Secrets, Scheduler |
| **Vercel Team** | LFIQ (6 projects deployed) | Hub, Intel, Command, Keystone, Registry, Stacks, Sticks |
| **Fly.io** | `brickston-backend` (app) | Command backend, Neon proxy |
| **Secrets Manager** | GCP Secret Manager (`brickston-v2`) | intel-neon-database-url, items-hub-database-url, command-database-url-direct, etc. |

## Local Setup (60 seconds)

```bash
# 1. Clone and install
git clone https://github.com/LFIQ-Git/02-brick.apps.git
cd 02-brick.apps
mise install
npm ci

# 2. Link to Vercel and pull environment variables
vercel link --project hub
vercel env pull

# 3. Pull GCP secrets
gcloud auth login
gcloud secrets versions access latest --secret=intel-neon-database-url --project=brickston-v2
# Save to ~/.pkm/secrets.json or app .env.local

# 4. Verify local development
npm run dev
# Visit http://localhost:3000 (or 3001, 3002, etc. depending on app)

# 5. Run health check
curl http://localhost:3000/api/health
```

## Key Logins & Credentials

### Clerk Login
- **Email:** justin@leftfieldinv.com (or team member email)
- **Provider:** Google OAuth or Microsoft (via accounts.lfiq.app)
- **Two-factor:** Enabled for all accounts

### Neon Database Access
- **Endpoint:** `ep-tiny-lab-akrddwgy.us-west-2.neon.tech`
- **Port:** 5432 (local proxy: 5433)
- **Auth:** Neon roles (intel, command, pkm, gdm_extractor, market_scraper)
- **How to connect:** Use DATABASE_URL from GCP secrets, not raw credentials

### Anthropic API (Claude)
- **Key location:** GCP Secret Manager (`anthropic-api-key`)
- **Apps using it:** Hub (chat), Keystone (automation)
- **Rate limits:** Standard Claude API tiers

### GitHub CLI
- **Setup:** `gh auth login`
- **Used for:** Cloning private repos, opening PRs, checking CI status
- **Token stored:** macOS Keychain

### Fly.io
- **Setup:** `flyctl auth login`
- **Used for:** Deploying brickston-backend, brick-mcp-server
- **Available commands:** `fly deploy`, `fly logs`, `fly status`

## Troubleshooting: Top 3 Issues

### Issue 1: "env vars missing" errors at startup
**Symptom:** App refuses to start, complains about missing NEXT_PUBLIC_* or DATABASE_URL  
**Fix:**  
```bash
# Pull latest from Vercel
vercel env pull

# If that fails, manually export:
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(gcloud secrets versions access latest --secret=clerk-publishable-key --project=brickston-v2)
export CLERK_SECRET_KEY=$(gcloud secrets versions access latest --secret=clerk-secret-key --project=brickston-v2)

# Then restart
npm run dev
```

### Issue 2: "Neon cold start timeout" (40-50s delay on first query)
**Symptom:** First database query hangs for 40+ seconds  
**Fix:**  
```bash
# Warm the connection pool with a dummy query
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech -U intel neondb -c "SELECT 1;"

# Then retry your app request
```

### Issue 3: "Invalid Clerk claims" in logs
**Symptom:** 403 errors, user cannot authenticate despite valid Clerk session  
**Fix:**  
```bash
# Clear browser cookies for accounts.lfiq.app and app domain
# In DevTools > Application > Cookies > Delete __session

# Log out and log back in via Clerk UI
# Verify CLERK_SECRET_KEY matches current GCP secret version
vercel env pull
```

## Learning Path (5 steps)

1. **Read the Architecture Overview** (10 min) — Understand the 8-app family, 10 schemas, and data flow
2. **Complete Local Setup** (20 min) — Clone, install, link Vercel, pull secrets
3. **Watch Hub Demo** (5 min) — See the entry point in action
4. **Explore Intel** (15 min) — View the inbox, understand how data arrives from 14 sources
5. **Open a PR and Deploy** (15 min) — Make a small change, push to a branch, deploy via Vercel

## Common Commands

```bash
# View app logs (Vercel)
vercel logs --follow

# Check Fly.io app status
flyctl status --app=brickston-backend

# Run tests locally
npm run test

# Start development server (interactive)
npm run dev -- --port 3001

# Deploy to staging (Vercel)
git push origin feature/your-branch

# Deploy to production (Vercel)
git push origin main  # triggers auto-deploy
```

## Emergency Contacts

| Role | Email | Slack |
|------|-------|-------|
| Owner / Platform Lead | justin@leftfieldinv.com | @Justin |
| Engineering | team@lfiq.app | #engineering |
| Operations | ops@leftfieldinv.com | #ops |

## Next Steps

- Read **Getting Started → Setup** for detailed local dev instructions
- Read **Architecture** for system overview and deployment topology
- Browse **Apps** for per-app guides (Hub, Intel, Command, Keystone, Registry, Stacks, Sticks)
- Check **Troubleshooting** for less common issues
