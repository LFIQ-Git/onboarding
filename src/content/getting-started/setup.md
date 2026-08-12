# Getting Started: Local Development Setup

Step-by-step guide to clone the LFIQ monorepo, install dependencies, configure secrets, and verify your development environment.

## Prerequisites

Before starting, ensure you have:
- **macOS** (Ventura or later)
- **Git** (installed via Xcode Command Line Tools)
- **GitHub CLI** (`gh` command installed)
- **GitHub account** with access to LFIQ-Git organization
- **Vercel account** (personal or team, linked to GitHub)
- **Docker Desktop** (optional, for local Postgres if needed)
- **GCP account** with access to `brickston-v2` project
- **Fly.io account** (for viewing logs of brickston-backend)

## Step 1: Clone & Install Dependencies

### 1a. Clone the monorepo
```bash
git clone https://github.com/LFIQ-Git/02-brick.apps.git
cd 02-brick.apps
```

### 1b. Install Node and Python versions via mise
```bash
# Install mise (if not already installed)
curl https://mise.jdx.dev/install.sh | sh

# Install Node 20 and Python 3.11
mise install

# Verify versions
node --version  # v20.x.x
python --version  # Python 3.11.x
```

### 1c. Install npm dependencies
```bash
npm ci
# This respects the package-lock.json exactly (better for CI/team consistency)
```

**Expected output:**
```
added 2000+ packages, and audited 2,345 packages in 15s
```

## Step 2: Authenticate with GitHub & GCP

### 2a. GitHub CLI authentication
```bash
gh auth login
# Follow prompts to authenticate
# Choose: HTTPS, login with browser, paste device code

# Verify authentication
gh auth status
```

### 2b. GCP authentication
```bash
gcloud auth login
# Browser will open, log in with your GCP account
# Select project: brickston-v2

gcloud config set project brickston-v2
```

## Step 3: Pull Secrets from GCP

Secrets are stored in GCP Secret Manager under `brickston-v2`. Create a local directory to cache them, then fetch each app's critical secrets.

### 3a. Create local secrets directory
```bash
mkdir -p ~/.pkm/secrets
cd ~/.pkm/secrets
```

### 3b. Fetch and cache database credentials
```bash
# Intel Neon database URL
gcloud secrets versions access latest --secret=intel-neon-database-url \
  --project=brickston-v2 > intel-database-url.txt

# Command database URL (direct, no connection pooling)
gcloud secrets versions access latest --secret=command-database-url-direct \
  --project=brickston-v2 > command-database-url-direct.txt

# Items Hub database URL (for items/observations)
gcloud secrets versions access latest --secret=items-hub-database-url \
  --project=brickston-v2 > items-hub-database-url.txt

# Verify retrieval
cat ~/.pkm/secrets/intel-database-url.txt
# Output should start with: postgresql://intel:...@ep-tiny-lab-akrddwgy...
```

### 3c. Fetch Clerk secrets
```bash
gcloud secrets versions access latest --secret=clerk-publishable-key \
  --project=brickston-v2 > ~/.pkm/secrets/clerk-publishable-key.txt

gcloud secrets versions access latest --secret=clerk-secret-key \
  --project=brickston-v2 > ~/.pkm/secrets/clerk-secret-key.txt
```

### 3d. Fetch Anthropic API key
```bash
gcloud secrets versions access latest --secret=anthropic-api-key \
  --project=brickston-v2 > ~/.pkm/secrets/anthropic-api-key.txt
```

## Step 4: Link Vercel & Pull Environment Variables

Each app in the monorepo is deployed via Vercel. Link your local checkout to the Vercel projects, then pull the environment variables.

### 4a. Link to Vercel
From the monorepo root:
```bash
vercel link --project hub
# Select: Link to existing project
# Choose: lfiq / hub
```

### 4b. Pull environment variables
```bash
vercel env pull
# Creates .env.local in the current app directory
# Pulls NEXT_PUBLIC_* and other build-time variables
```

Repeat for each app (if developing on multiple):
```bash
# From 02-brick.apps/apps/hub
vercel link --project hub && vercel env pull

# From 02-brick.apps/apps/intel
vercel link --project intel && vercel env pull

# From 02-brick.apps/apps/command
vercel link --project command && vercel env pull

# ... and so on for keystone, registry, stacks, sticks
```

## Step 5: Verify Local Development Environment

### 5a. Start the Hub app (default)
```bash
cd /path/to/02-brick.apps/apps/hub
npm run dev
# Expected output:
# ▲ Next.js 15.0.0
# - Local: http://localhost:3000
# - Environments: .env.local
```

### 5b. Health check
```bash
# In another terminal
curl http://localhost:3000/api/health
# Expected: {"status": "ok"}
```

### 5c. Open in browser
Navigate to http://localhost:3000 in your browser. You should see:
- Hub splash page (public, no login required initially)
- "Sign in with Google" or "Sign in with Microsoft" button
- Clerk authentication flow (accounts.lfiq.app)

### 5d. Test Clerk authentication
- Click "Sign in with Google"
- Use your Google account (if @leftfieldinv.com) or personal Google account
- After login, you should see the Hub home page with document index
- Profile menu in top-right corner

## Step 6: Set Up Other Apps (Repeat as Needed)

Once Hub is verified, set up the other apps. Each follows the same pattern:

```bash
# Intel
cd ../intel
vercel link --project intel
vercel env pull
npm run dev  # Runs on http://localhost:3001

# Command
cd ../command
vercel link --project command
vercel env pull
npm run dev  # Runs on http://localhost:3002

# Keystone
cd ../keystone
vercel link --project keystone
vercel env pull
npm run dev  # Runs on http://localhost:3003

# Registry
cd ../registry
vercel link --project registry
vercel env pull
npm run dev  # Runs on http://localhost:3004

# Stacks
cd ../stacks
vercel link --project stacks
vercel env pull
npm run dev  # Runs on http://localhost:3005

# Sticks
cd ../sticks
vercel link --project sticks
vercel env pull
npm run dev  # Runs on http://localhost:3006
```

## Troubleshooting Common Errors

### Error 1: "Module not found: next/font/google"
**Symptom:** `npm run dev` fails with module resolution error  
**Cause:** Next.js version mismatch or incomplete npm install  
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm ci
npm run dev
```

### Error 2: "ENOENT: no such file or directory, open .env.local"
**Symptom:** App starts but complains about missing .env.local  
**Cause:** Vercel link failed or vercel env pull didn't run  
**Fix:**
```bash
vercel link --project hub --yes
vercel env pull
npm run dev
```

### Error 3: "Connection timeout on Neon database"
**Symptom:** Queries hang for 40+ seconds, then timeout  
**Cause:** Neon cold start or network connectivity  
**Fix:**
```bash
# Warm the connection
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech \
  -U intel -d neondb -c "SELECT 1;"
# Then retry the app request
```

### Error 4: "Cannot find module '@brick/ui'"
**Symptom:** TypeScript error about shared UI package  
**Cause:** Monorepo linking not resolved  
**Fix:**
```bash
npm run build -w packages/ui
npm ci
npm run dev
```

### Error 5: "GCP authentication expired"
**Symptom:** `gcloud` commands fail with "Access Denied"  
**Cause:** GCP token expired  
**Fix:**
```bash
gcloud auth login
gcloud config set project brickston-v2
# Re-run secret fetch
```

## What's Next?

- Browse the **Architecture** guide to understand the 8-app family and data topology
- Read the **Hub** guide to learn the entry point interface and chat proxy
- Read **Intel** to understand data ingestion from 14 sources
- Read **Command** for portfolio management workflows
- Open a pull request to verify your Git + Vercel setup end-to-end
