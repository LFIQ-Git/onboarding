# Command App Guide

Command is the portfolio management system for LFIQ. It provides operators with property data, leasing workflows, maintenance tracking, collections management, and risk scoring.

## What It Does

Command is a comprehensive portfolio operating system:
- **Properties:** Unit count, occupancy, rent rolls, lease maturity
- **Leasing:** Tenant pipeline, move-outs, re-rent timeline, velocity
- **Maintenance:** Work orders, cost tracking, technician dispatch
- **Collections:** Delinquency cases, payment tracking, resident exclusions
- **Risk:** Property risk scores, market warnings, lease expiry alerts
- **Reporting:** Dashboards, metrics, historical trends

**Primary features:**
- Property browser (search, filter, bulk actions)
- Rent roll editor
- Lease expiry timeline
- Work order dispatch
- Collections dashboard
- Risk scoring engine

## Deployment

| Environment | URL | Status | Platform |
|-------------|-----|--------|----------|
| **Production** | https://command.lfiq.app | Live | Vercel (frontend) + Fly.io (backend) |
| **Preview** | https://command-branch.lfiq.app | Auto-deploy on PR | Vercel |
| **Local Dev** | http://localhost:3002 | Via `npm run dev` | Local machine |

## Tech Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **Frontend** | Next.js 15 monorepo | React 19, 7 sub-apps (web, collect, leasing, repair, documents, risk, utilities) |
| **Language** | TypeScript | Full type coverage |
| **Auth** | Neon Auth + Auth.js | Database RLS per role |
| **Database** | Neon (portfolio, collect, repair schemas) | Direct + pooled connections |
| **Backend API** | Fly.io (brickston-backend) | FastAPI, Neon proxy, GraphQL |
| **GraphQL** | Fly.io | Schema defined in brickston-backend |
| **Jobs** | GCP Cloud Run | Renovation ROI, risk scoring, market scraping |
| **Deployment** | Vercel + Fly.io | Auto-deploy on main |

## Local Development

### Start the App

```bash
cd /path/to/02-brick.apps/apps/command
npm run dev
# Runs on http://localhost:3002
```

**Note:** Command is a Next.js monorepo with 7 sub-apps. The `npm run dev` command starts all of them.

### Sub-apps (separate ports)

- **web** (port 3002) — Main portfolio management UI
- **leasing** (port 3201) — Leasing pipeline, vacancy
- **collect** (port 3202) — Collections, delinquency cases
- **repair** (port 3203) — Maintenance, work orders
- **risk** (port 3204) — Risk scoring, alerts
- **utilities** (port 3205) — Utility tracking, bills
- **documents** (port 3206) — Document uploads, sharing

### Environment Variables

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `DATABASE_URL` | Yes | Neon connection (portfolio schema, command role) |
| `DATABASE_URL_UNPOOLED` | Yes | Neon direct (no connection pooling) |
| `NEXTAUTH_SECRET` | Yes | Session encryption |
| `NEXTAUTH_URL` | No | Callback URL |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base (Fly.io) |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | No | GraphQL endpoint |

Pull from Vercel:
```bash
vercel env pull
```

## Backend: Fly.io brickston-backend

Command's backend is a Python FastAPI application running on Fly.io. It provides:
- GraphQL API (portfolio, properties, leases)
- Neon database proxy
- Rate limiting and caching
- Authentication validation

### Deploying Changes to Fly.io

```bash
# After git push to main
git push origin main

# Then manually deploy (Fly.io doesn't auto-deploy like Vercel)
cd /path/to/02-brick.apps
flyctl deploy --app=brickston-backend

# Or trigger from CI/CD
# (check .github/workflows/deploy-fly.yml)
```

### Viewing Fly.io Logs

```bash
flyctl logs --app=brickston-backend --follow

# Or check recent logs
flyctl logs --app=brickston-backend --limit=50
```

## Key Flows

### Flow 1: Property Overview
1. User navigates to command.lfiq.app/properties
2. Frontend queries Fly.io GraphQL endpoint for all properties
3. Results include: property ID, address, units, occupancy, net rent
4. User clicks property → detailed view with rent roll, leases, maintenance

### Flow 2: Create Work Order
1. User navigates to repair.lfiq.app
2. User clicks "New Work Order"
3. Form: select property, unit, issue type, urgency, assigned technician
4. Submit → INSERT into repair.work_orders
5. Cloud Run repair dispatcher notifies technician
6. Technician receives assignment in mobile app (if available)

### Flow 3: Delinquency Case Management
1. User navigates to collect.lfiq.app
2. Dashboard shows delinquency cases (overdue payments)
3. User clicks case → resident interaction history, payment agreements
4. Options: mark as paid, set payment plan, refer to attorney, resident exclusion
5. Case workflow: Open → Resolution (paid/default/legal)

## Database Schema

Command uses three Neon schemas:

**portfolio** (primary)
- properties, units, leases, residents, valuations, rent history
- ~50,000 rows total

**collect** (collections management)
- delinquency_cases, resident_exclusions, payment_history
- ~30,000 rows

**repair** (maintenance)
- work_orders, technicians, dispatch_logs, cost_tracking
- ~100,000 rows (mostly historical)

## Troubleshooting

### Issue 1: "Backend API timeout"
**Symptom:** Property list takes 30+ seconds to load  
**Cause:** Fly.io app sleeping, Neon connection timeout, or slow GraphQL query  
**Fix:**
```bash
# Wake up Fly.io app
curl https://brickston-backend.lfiq.app/health
# Should respond with 200 OK

# Check Fly.io status
flyctl status --app=brickston-backend

# Warm Neon connection
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech \
  -U command neondb -c "SELECT 1 FROM portfolio.properties LIMIT 1;"
```

### Issue 2: "Rent roll editor doesn't save changes"
**Symptom:** Clicking "Save" shows loading state but nothing persists  
**Cause:** GraphQL mutation failed, Neon RLS denied write, or session expired  
**Fix:**
```bash
# Check browser network tab (DevTools > Network)
# Look for failed GraphQL mutation request
# Verify response status and error message

# If 403 Forbidden: user doesn't have write permission
# Contact ops team to update user role

# If 500 Internal Server Error: check Fly.io logs
flyctl logs --app=brickston-backend
```

### Issue 3: "Work order not appearing in technician app"
**Symptom:** Created work order in repair.lfiq.app but technician doesn't see it  
**Cause:** Dispatcher job failed, technician not assigned, or mobile app not synced  
**Fix:**
```bash
# Check Cloud Run dispatcher job
gcloud run logs read repair-dispatcher --project=brickston-v2

# Manually re-trigger dispatcher
gcloud run jobs execute repair-dispatcher --project=brickston-v2

# Verify work_orders record was created
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech \
  -U command neondb \
  -c "SELECT * FROM repair.work_orders WHERE created_at > now() - interval '1 hour';"
```

## Common Tasks

### Task 1: Query Properties
```sql
-- Get all properties with occupancy
SELECT 
  p.id, p.address, 
  COUNT(u.id) as unit_count,
  SUM(CASE WHEN u.occupied THEN 1 ELSE 0 END) as occupied_units,
  ROUND(100.0 * SUM(CASE WHEN u.occupied THEN 1 ELSE 0 END) / COUNT(u.id), 2) as occupancy_pct
FROM portfolio.properties p
LEFT JOIN portfolio.units u ON u.property_id = p.id
GROUP BY p.id, p.address
ORDER BY p.address;
```

### Task 2: Find Lease Expirations (Next 90 Days)
```sql
SELECT 
  p.address, u.unit_number,
  l.resident_name, l.move_out_date
FROM portfolio.properties p
JOIN portfolio.units u ON u.property_id = p.id
JOIN portfolio.leases l ON l.unit_id = u.id
WHERE l.move_out_date BETWEEN now() AND now() + interval '90 days'
ORDER BY l.move_out_date ASC;
```

### Task 3: Create a Delinquency Case
```sql
INSERT INTO collect.delinquency_cases (
  unit_id, resident_id, status, 
  amount_owed, days_past_due, 
  created_at
) VALUES (
  $1, $2, 'open',
  1500.00, 45,
  now()
);

-- Then notify collections team
-- (Usually done by trigger or application code)
```

## Sub-app Guides

Each sub-app within Command has specialized workflows:

| Sub-app | Purpose | URL (local) | Key Tables |
|---------|---------|------------|-----------|
| **web** | Portfolio overview | localhost:3002 | portfolio.properties, portfolio.units |
| **leasing** | Vacancy pipeline | localhost:3201 | portfolio.leases, portfolio.move_outs |
| **collect** | Collections | localhost:3202 | collect.delinquency_cases |
| **repair** | Work orders | localhost:3203 | repair.work_orders |
| **risk** | Risk scoring | localhost:3204 | (computed, not stored) |
| **utilities** | Utility management | localhost:3205 | utilities.invoices (if applicable) |
| **documents** | Document uploads | localhost:3206 | (file storage in Box/Drive) |

See each sub-app's own documentation for detailed workflows.

## Related Documentation

- **Architecture:** Fly.io backend, GraphQL API, database schema
- **Getting Started:** Setup, Logins, Install Tools
- **Intel:** Observations feed into Command inbox
- **Brick Fleet Review:** Deployment hygiene and CI/CD gates
