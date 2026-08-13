# Getting Started: Logins & Authentication

Complete reference for the authentication systems used across LFIQ applications: Clerk, the Sticks exception, database roles, and API credentials.

## Clerk Authentication (BRICK Apps)

One shared Clerk instance covers Hub, Intel, Command and its sub-apps, Keystone, Registry, and Stacks. Log in once and the session carries across all of them. Sticks is the exception and runs its own NextAuth setup, covered below. Full depth is on [Clerk Authentication](/docs/clerk-auth).

NextAuth and the old `@brick/auth` package were retired from the BRICK apps in the June 2026 migration. If you find `NEXTAUTH_SECRET` or `NEXTAUTH_URL` referenced in one of those repos, it is dead configuration.

### Logging In

**Supported Providers:**
- Google
- Microsoft

That is the whole list. Password, passkey and email-code sign-in are all disabled on the instance. The org is split across Google Workspace and Microsoft 365, which is why both providers exist rather than Google alone.

**Login Flow:**
1. Visit any BRICK app (hub.lfiq.app, intel.lfiq.app, etc.)
2. Click "Sign in with Google" or "Sign in with Microsoft"
3. Redirect to the hosted Clerk sign-in
4. Authenticate with your provider
5. Redirect back to the app with a Clerk session cookie

The exact Clerk sign-in domain is not verified. The live instance and several repo docs disagree. Confirm with Justin before publishing it anywhere.

**Troubleshooting Clerk Login:**
- **Cannot sign up at all:** Sign-up is restricted to an allowlist of company domains. You have to be invited before your first sign-in. The allowlist gates sign-ups only, so once you exist you always sign in
- **"Session cookie expired":** Clear the `__session` cookie for the app domain and the Clerk domain, then sign in again
- **Signed in but access denied:** You are authenticated but your Clerk org role does not include that app. A `brick_admin` grants it

### Access Model

Access is decided by the Clerk org role, surfaced to each app as the `sessionClaims.apps` claim and checked in middleware.

| App role | Clerk org role | Grants |
|----------|----------------|--------|
| `brick_admin` | `org:admin` | Hub, Registry, Intel, Command, Keystone, plus admin surfaces |
| `command_user` | `org:member` | Command only |

Clerk is the single source of truth. The `items.auth_allowed_users` table is a read-only projection refreshed on every `/admin/users` load. Inserting a row there grants nothing.

**Two ways to add a user:** Hub `/admin/users` (you must be `brick_admin`), or the Clerk Dashboard's invite flow.

### Clerk Environment Variables (for Developers)

Pulled from Vercel with `vercel env pull`, never from a repo:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # BRICK_CLERK_PUBLISHABLE_KEY is the fallback name
CLERK_SECRET_KEY=                    # BRICK_CLERK_SECRET_KEY is the fallback name
BRICK_CLERK_ORGANIZATION_ID=
BRICK_AUTH_DISABLED=                 # local dev only
```

Production needs a `pk_live_` publishable key. A `pk_test_` key points at a throwaway development instance that does not know your account.

Do not pass these keys as module-level options to `clerkMiddleware`. Clerk reads them from the environment, and passing them explicitly breaks in the Edge Runtime.

## Sticks Authentication (NextAuth)

Sticks did not move to Clerk. It runs NextAuth v5 with a Google provider only, and gates access with an email allowlist checked in the sign-in callback.

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session encryption |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_ALLOWED_EMAILS` | Comma-separated allowlist |

A trailing space pasted into `AUTH_GOOGLE_ID` is sent to Google verbatim and produces `Error 401: invalid_client`. Check for whitespace before assuming the client is misconfigured.

## Neon Database Authentication

Direct database access uses Neon roles and connection strings. Each app connects with a least-privilege role.

### Connection Strings

**Base endpoint:** `ep-tiny-lab-akrddwgy.us-west-2.neon.tech`

**Format:**
```
postgresql://ROLE:PASSWORD@ep-tiny-lab-akrddwgy.us-west-2.neon.tech/neondb?sslmode=require
```

### Database Roles (Least Privilege)

| Role | Apps | Allowed Schemas | Notes |
|------|------|-----------------|-------|
| `intel` | Intel | items, market, portfolio (read) | Ingest |
| `command` | Command, brickston-backend | portfolio, collect, repair, gdm (read), market (read) | CRUD operations |
| `pkm` | Keystone | public | Daily briefing, tasks |
| `gdm_extractor` | GDM extract job | gdm | Golden Data Model sync |
| `market_scraper` | Market scrape jobs | market | Rent trends, comps |
| `neondb_owner` | Migrations only | * | DDL and RLS policies, never an app runtime role |

Grants alone are not always enough. Several tables have Row-Level Security enabled, and a role without a policy sees zero rows with no error. Add policies as `neondb_owner`, not through the app-role migration runner.

### Getting a Connection String

The DSN comes from the app's Vercel environment:

```bash
cd /path/to/the/app
vercel env pull
grep DATABASE_URL .env.local
```

Use the pooled `DATABASE_URL` at runtime. `DATABASE_URL_UNPOOLED` is for migration tooling only, and in at least one project it is stored wrapped in literal quotes, so code that reads it has to strip them.

### Local Database Access

Connect directly to Neon with `psql`. There is no proxy step; Cloud SQL was deleted.

```bash
psql "$DATABASE_URL" -c "SELECT * FROM portfolio.properties LIMIT 5;"
```

**Port:** 5432 (Neon standard)  
**SSL Mode:** Required (always use `sslmode=require`)  
**Schema:** The Neon console defaults to `public`. Switch the dropdown or qualify the table, or the data will look missing.

## Google OAuth (Clerk Social Provider)

Clerk delegates OAuth to Google. End users authenticate via Google Accounts.

### Configuration Details

**Scopes:** Basic profile (email, name)  
**Callback:** Clerk handles redirects automatically  
**Where it is configured:** the Clerk dashboard. The Clerk Backend API does not expose auth strategies or the domain allowlist, so these cannot be changed by script.

### Troubleshooting Google OAuth

- **"Invalid OAuth client":** Clerk OAuth config drifted; contact platform team
- **"Access denied":** The account's domain is not on the Clerk sign-up allowlist
- **"Scope not granted":** User declined permission; ask them to log in again and grant all permissions

## Microsoft OAuth (Clerk Social Provider)

Clerk delegates OAuth to Microsoft. End users authenticate via Microsoft accounts and Microsoft 365 subscriptions.

### Configuration Details

**Scopes:** Basic profile (email, name, tenant ID)  
**Callback:** Clerk handles redirects automatically

Microsoft is not optional. Part of the organization is on Microsoft 365 rather than Google Workspace, and a Google-only setup would lock those users out.

### Troubleshooting Microsoft OAuth

- **"Invalid OAuth client":** Clerk OAuth config drifted; contact platform team
- **"Tenant mismatch":** The account is from a tenant that is not allowlisted. A personal Microsoft account will not provision either
- **"Scope not granted":** User declined permission; ask them to log in again and grant all permissions

## GitHub CLI Authentication

GitHub CLI (`gh`) is used for cloning private repos, opening pull requests, and checking CI status.

### Initial Setup

```bash
gh auth login
# Follow prompts:
# ? What is your preferred protocol for Git operations? [HTTPS/SSH] → Choose HTTPS
# ? How would you like to authenticate GitHub CLI? [Login with a browser/Paste an authentication token] → Login with browser
# ? Open user authorization in your browser? [Y/n] → Y
# (browser opens, show device code, authorize)
```

### Verify Authentication

```bash
gh auth status
# Expected output:
# github.com
#   ✓ Logged in to github.com as YourGitHubUsername
#   ✓ Git operations protocol: https
#   ✓ Token: ghu_***
#   ✓ Token scopes: repo, read:org, gist
```

### Token Storage

GitHub CLI automatically stores your token in macOS Keychain:
```
Keychain account: github.com
Service: gh
```

### Troubleshooting GitHub CLI

- **"Not authorized":** Run `gh auth login` again
- **"Wrong GitHub account":** Logout and log back in:
  ```bash
  gh auth logout
  gh auth login
  ```
- **Token expired:** Re-authenticate:
  ```bash
  gh auth refresh
  ```

## GCP Authentication

You will rarely need this. GCP is a wind-down, not a working surface. Billing is disabled on the `brickston-v2` project, so the Cloud Scheduler API refuses every call. Batch jobs run on Fly and application secrets live in Vercel and Fly. Two Vertex AI workloads and one idle Cloud Run job are what remain.

```bash
gcloud auth login --launch-browser
# The out-of-band flow is deprecated and fails. Use --launch-browser.
```

If a `gcloud` call returns "Reauthentication failed / cannot prompt", just retry. The credential often refreshes on the second attempt.

See [GCP Cloud Run](/docs/gcp-cloud-run) for what is actually left.

## Fly.io Authentication

Fly.io hosts `brickston-backend` (the Command API), `brick-cron` (the batch-job dispatcher), `brick-mcp-server`, and `pkm-mcp`. Authentication is via API token.

### Setup Flyctl

```bash
flyctl auth login
# Browser opens, log in with your Fly.io account
# Token is stored in ~/.fly/credentials.yml
```

### Verify Flyctl Authentication

```bash
flyctl auth whoami
# Expected output: your-email@example.com
```

### Common Flyctl Commands

```bash
# View app status
flyctl status --app=brickston-backend

# View logs
flyctl logs --app=brickston-backend

# Deploy (requires git push first, and a running Docker daemon)
colima start
flyctl deploy --app brickston-backend --local-only

# SSH into running instance
flyctl ssh console --app brickston-backend

# Run a batch job by its crontab label
flyctl ssh console -a brick-cron -C "/app/run-job.sh <label>"
```

When an app runs more than one machine, `flyctl ssh sftp put` and `flyctl ssh console` can land on different machines, so an uploaded file appears to vanish. Pass the script inline instead of uploading it.

### Troubleshooting Fly.io

- **"Not authenticated":** Run `flyctl auth login` again
- **"Permission denied":** You don't have access to the brickston-backend app; contact platform team
- **"Failed to deploy":** Check build logs:
  ```bash
  flyctl logs --app=brickston-backend --follow
  ```

## Anthropic API

Hub and Keystone use the Anthropic API for Claude chat and embeddings.

### API Key

The key name is `ANTHROPIC_API_KEY`. It is set in each app's Vercel environment and on the relevant Fly apps.

```bash
vercel env pull
grep ANTHROPIC_API_KEY .env.local
```

### Usage

- **Hub chat proxy**: sends user messages to Claude via Anthropic API
- **Keystone embeddings**: generates embeddings for RAG (Retrieval-Augmented Generation)
- **Intel insights**: Claude analysis on observations and properties

### Rate Limits & Quotas

Rate limits and the spend cap are whatever is set on the account in the Anthropic console. Check there rather than assuming a tier.

### Troubleshooting Anthropic API

- **"Invalid API key":** Key rotated. Re-run `vercel env pull`, and update the Fly secret too if the backend is affected
- **"Rate limit exceeded":** Too many concurrent requests; add exponential backoff
- **"Quota exceeded":** Spend limit hit; check the Anthropic console

## Summary: Which Credentials Do I Need?

| Role | GitHub CLI | Vercel | Clerk | Fly.io | GCP |
|------|-----------|--------|-------|--------|-----|
| Developer (Frontend) | ✓ | ✓ (env pull) | ✓ (as a user) | ✗ | ✗ |
| Developer (Backend) | ✓ | ✓ (env pull) | ✓ (as a user) | ✓ | ✗ |
| DevOps / Platform | ✓ | ✓ (admin) | ✓ (admin) | ✓ | ✓ (residual workloads only) |
| Product Manager | ✓ | ✗ | ✓ (as a user) | ✗ | ✗ |

## Next Steps

- Complete **Setup** to clone the monorepo and install all tools
- Read each **App Guide** (Hub, Intel, Command, etc.) for app-specific auth flows
- See [Auth Issues](/docs/auth-issues) for common authentication failures across all apps
