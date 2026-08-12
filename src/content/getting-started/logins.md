# Getting Started: Logins & Authentication

Complete reference for all authentication systems used across LFIQ applications: Clerk OAuth, database roles, API credentials, and GCP service accounts.

## Clerk Authentication (Web Apps)

Clerk is the centralized OAuth broker for all web applications. Single sign-on means logging in once at accounts.lfiq.app grants access to all LFIQ apps.

### Logging In

**Supported Providers:**
- Google OAuth (any Gmail account, @leftfieldinv.com preferred)
- Microsoft OAuth (any Microsoft account, Microsoft 365 preferred)

**Login Flow:**
1. Visit any LFIQ app (hub.lfiq.app, intel.lfiq.app, etc.)
2. Click "Sign in with Google" or "Sign in with Microsoft"
3. Redirect to accounts.lfiq.app (Clerk tenant)
4. Authenticate with your provider
5. Redirect back to the app with a Clerk session cookie

**Troubleshooting Clerk Login:**
- **"Invalid credential" error:** Make sure your email is on the allowlist in Clerk settings
- **"Session cookie expired":** Clear browser cookies and log in again
  ```
  DevTools > Application > Cookies > delete __session (accounts.lfiq.app)
  DevTools > Application > Cookies > delete __session (app domain)
  ```
- **"Unauthorized" after login:** Your user account doesn't have permission for this app; contact team@lfiq.app

### OAuth Configuration

**Clerk Tenant:** lfiq-cloud  
**Auth URL:** https://accounts.lfiq.app  
**Configured Providers:**
- Google OAuth (via Google Cloud OAuth app)
- Microsoft OAuth (via Azure AD)

**User Allowlist:** Managed in Clerk Dashboard (Settings > Email Allowlist)  
**Two-Factor:** Optional per user (can be enabled in Clerk user settings)

### Clerk Secrets (for Developers)

In your `.env.local` (fetch from GCP Secret Manager):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from GCP secret clerk-publishable-key>
CLERK_SECRET_KEY=<from GCP secret clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Fetch from GCP:
```bash
gcloud secrets versions access latest --secret=clerk-publishable-key --project=brickston-v2
gcloud secrets versions access latest --secret=clerk-secret-key --project=brickston-v2
```

## Neon Database Authentication

Direct database access uses Neon roles and connection strings. Each app connects with a least-privilege role.

### Connection Strings

**Base endpoint:** `ep-tiny-lab-akrddwgy.us-west-2.neon.tech`

**Format:**
```
postgresql://ROLE:PASSWORD@ep-tiny-lab-akrddwgy.us-west-2.neon.tech/neondb?sslmode=require
```

### Database Roles (Least Privilege)

| Role | Password | Apps | Allowed Schemas | Notes |
|------|----------|------|-----------------|-------|
| `intel` | (in GCP) | Intel | items, market, portfolio (read) | Ingest only |
| `command` | (in GCP) | Command | portfolio, collect, repair, items (read) | CRUD operations |
| `pkm` | (in GCP) | Keystone | public | Daily briefing, tasks |
| `gdm_extractor` | (in GCP) | GCP Cloud Run | gdm | Golden Data Model sync |
| `market_scraper` | (in GCP) | GCP Cloud Run | market | Rent trends, comps |
| `neondb_owner` | (in GCP) | Migrations only | * | Schema changes, not for apps |

### Fetching Connection Strings

```bash
# Intel
gcloud secrets versions access latest --secret=intel-neon-database-url --project=brickston-v2

# Command (direct, no connection pooling)
gcloud secrets versions access latest --secret=command-database-url-direct --project=brickston-v2

# Items Hub (observations)
gcloud secrets versions access latest --secret=items-hub-database-url --project=brickston-v2
```

### Local Database Access

For development, connect directly to Neon using `psql`:

```bash
# Connect as intel role
export DATABASE_URL=$(gcloud secrets versions access latest --secret=intel-neon-database-url --project=brickston-v2)
psql "$DATABASE_URL"

# Or manually
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech \
  -U intel -d neondb \
  -c "SELECT * FROM portfolio.properties LIMIT 5;"
```

**Port:** 5432 (Neon standard)  
**SSL Mode:** Required (always use `sslmode=require`)

## Google OAuth (Clerk Social Provider)

Clerk delegates OAuth to Google. End users authenticate via Google Accounts.

### Configuration Details

**Google OAuth Client:** Managed in GCP console under lfiq-cloud project  
**Scopes:** Basic profile (email, name)  
**Callback:** Clerk handles redirects (automatic)

### Troubleshooting Google OAuth

- **"Invalid OAuth client":** Clerk OAuth config drifted; contact platform team
- **"Access denied":** User's Google account is not on the Clerk allowlist
- **"Scope not granted":** User declined permission; ask them to log in again and grant all permissions

## Microsoft OAuth (Clerk Social Provider)

Clerk delegates OAuth to Microsoft. End users authenticate via Microsoft accounts and Microsoft 365 subscriptions.

### Configuration Details

**Azure AD Tenant:** lfiq-cloud (via Clerk)  
**Scopes:** Basic profile (email, name, tenant ID)  
**Callback:** Clerk handles redirects (automatic)

### Troubleshooting Microsoft OAuth

- **"Invalid OAuth client":** Clerk OAuth config drifted; contact platform team
- **"Tenant mismatch":** User's Microsoft account is from a different tenant; use a personal Microsoft account
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

## GCP Service Account Authentication

Service accounts are used for automated access to GCP resources (Cloud Run jobs, Secret Manager, Cloud Scheduler).

### When You Need It

- Deploying to Cloud Run
- Accessing GCP Secret Manager
- Checking Cloud Scheduler status
- Viewing Cloud Logging

### Authentication Methods

**Application Default Credentials (recommended):**
```bash
gcloud auth application-default login
# Stores credentials in ~/.config/gcloud/application_default_credentials.json
```

**Service Account JSON (CI/CD only):**
```bash
# Download from GCP Console (never commit this file)
gcloud auth activate-service-account --key-file=/path/to/key.json
```

### Verify GCP Authentication

```bash
gcloud auth list
# Expected output: your account marked with *

gcloud config list
# Expected output: project = brickston-v2, region = us-west1
```

### Using Service Accounts in Apps

Apps don't typically need to authenticate as a GCP service account. Instead, they use **Workload Identity Federation** (OIDC):
- Vercel app → Cloud Run (OIDC token from Vercel)
- Fly.io app → GCP APIs (OIDC token from Fly.io)

See the per-app guides for details.

## Fly.io Authentication

Fly.io hosts brickston-backend. Authentication is via API token.

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

# Deploy (requires git push first)
flyctl deploy --app=brickston-backend

# SSH into running instance
flyctl ssh console --app=brickston-backend
```

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

Stored in GCP Secret Manager:
```bash
gcloud secrets versions access latest --secret=anthropic-api-key --project=brickston-v2
```

In `.env.local` (fetch from GCP):
```bash
ANTHROPIC_API_KEY=<from GCP secret anthropic-api-key>
```

### Usage

- **Hub chat proxy** — sends user messages to Claude via Anthropic API
- **Keystone embeddings** — generates embeddings for RAG (Retrieval-Augmented Generation)
- **Intel insights** — Claude analysis on observations and properties

### Rate Limits & Quotas

- **Default tier:** 1 RPS (request per second)
- **Burst:** up to 5 concurrent requests
- **Monthly spend limit:** Set in Anthropic console ($500/month default)

### Troubleshooting Anthropic API

- **"Invalid API key":** Key expired or rotated; fetch latest from GCP
  ```bash
  gcloud secrets versions access latest --secret=anthropic-api-key --project=brickston-v2
  ```
- **"Rate limit exceeded":** Too many concurrent requests; add exponential backoff
- **"Quota exceeded":** Monthly spend limit hit; check Anthropic console for charges

## Summary: Which Credentials Do I Need?

| Role | GitHub CLI | GCP Auth | Clerk | Fly.io | Anthropic |
|------|-----------|----------|-------|--------|-----------|
| Developer (Frontend) | ✓ | ✓ (read secrets) | (via Clerk UI) | ✗ | ✗ |
| Developer (Backend) | ✓ | ✓ (deploy, secrets) | (via Clerk UI) | ✓ | ✓ |
| DevOps / Platform | ✓ | ✓ (full access) | ✓ (admin) | ✓ | ✓ |
| Product Manager | ✓ | ✗ | (via Clerk UI) | ✗ | ✗ |

## Next Steps

- Complete **Setup** to clone the monorepo and install all tools
- Read each **App Guide** (Hub, Intel, Command, etc.) for app-specific auth flows
- See **Troubleshooting** for common authentication issues across all apps
