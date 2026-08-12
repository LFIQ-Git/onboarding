# Getting Started: Install Tools

Complete checklist of tools required to develop on the LFIQ platform. Install these before starting the Setup guide.

## Tool Summary

| Tool | Purpose | Installed Via | Version Required |
|------|---------|---------------|------------------|
| Claude Code | Desktop agent & CLI | App Store / claude.com | Latest |
| GitHub CLI | Clone repos, manage PRs | Homebrew or download | 2.30+ |
| Node.js | JavaScript runtime | mise | 20.x |
| Python | Automation, scripting | mise | 3.11.x |
| npm | Package manager | Node.js included | 10.x+ |
| Vercel CLI | Deploy, link projects | npm | 35.0+ |
| Flyctl | Fly.io deployment | Homebrew | 0.2+ |
| Docker Desktop | Optional, local Postgres | Docker.com | 4.20+ |
| mise | Version manager | Homebrew | Latest |
| gcloud | GCP CLI | Google Cloud SDK | Latest |

## Claude Code (Recommended but Optional)

Claude Code is the official Claude IDE for macOS, providing desktop agent capabilities, Cursor integration, and local file editing.

### Installation

1. Visit https://claude.com/claude-code
2. Download Claude Code for macOS
3. Move to Applications folder
4. Launch and authenticate with your claude.ai account

### Verification

```bash
# Claude Code is launchable from Spotlight (Cmd+Space, type "Claude Code")
# Or from Applications folder
```

## GitHub CLI

GitHub CLI (`gh`) is required for cloning private repos, creating pull requests, and checking CI status.

### Installation via Homebrew

```bash
brew install gh
```

### Installation via Direct Download

```bash
# Download the latest macOS release
curl -L https://github.com/cli/cli/releases/download/v2.41.0/gh_2.41.0_macOS_arm64.tar.gz -o gh.tar.gz
tar xzf gh.tar.gz
sudo mv gh_2.41.0_macOS_arm64/bin/gh /usr/local/bin/
```

### Verification

```bash
gh --version
# Expected: gh version 2.30.0 (2023-11-14)
```

### Post-Installation

Authenticate with GitHub:
```bash
gh auth login
# Follow prompts to authorize via browser
```

## Node.js & Python via mise

**mise** is a version manager that ensures all developers use the same Node.js and Python versions. Install mise, then let it handle Node and Python.

### Installation: mise

```bash
curl https://mise.jdx.dev/install.sh | sh
export PATH="$HOME/.local/share/mise/shims:$PATH"
echo 'export PATH="$HOME/.local/share/mise/shims:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verification

```bash
mise --version
# Expected: mise 2024.x.x
```

### Installation: Node.js 20 & Python 3.11

Once mise is installed, navigate to the 02-brick.apps monorepo and run:

```bash
cd /path/to/02-brick.apps
mise install
# Reads .mise.toml, installs Node 20 + Python 3.11
```

### Verification

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
python --version  # Python 3.11.x
```

If versions don't match, add mise shims to PATH:
```bash
eval "$(mise activate zsh)"
# Or add to ~/.zshrc permanently
```

## npm (Included with Node.js)

npm is the JavaScript package manager. It comes with Node.js, so no separate installation needed.

### Verification

```bash
npm --version
# Expected: 10.x.x or later
```

### First-Time Setup

```bash
npm config set legacy-peer-deps true
# Allows some dependency conflicts to be ignored
```

## Vercel CLI

Vercel CLI links your local checkout to Vercel projects and pulls environment variables.

### Installation

```bash
npm install -g vercel
```

### Verification

```bash
vercel --version
# Expected: Vercel 35.0.0 or later
```

### Post-Installation

```bash
vercel login
# Browser opens, authenticate with your GitHub account (via Vercel)
```

## Flyctl (for Fly.io)

Flyctl is the deployment tool for Fly.io, used to manage brickston-backend.

### Installation via Homebrew

```bash
brew install flyctl
```

### Installation via Direct Download

```bash
curl -L https://fly.io/install.sh | sh
export PATH="$PATH:$HOME/.fly/bin"
echo 'export PATH="$PATH:$HOME/.fly/bin"' >> ~/.zshrc
```

### Verification

```bash
flyctl version
# Expected: 0.2.x or later
```

### Post-Installation

```bash
flyctl auth login
# Browser opens, authenticate with Fly.io account
```

## Docker Desktop (Optional)

Docker is optional but useful for:
- Running a local Postgres instance (instead of connecting to Neon)
- Testing deployment containers locally

### Installation

1. Download from https://www.docker.com/products/docker-desktop
2. Install and launch Docker Desktop
3. Grant permission when prompted

### Verification

```bash
docker --version
# Expected: Docker version 4.20.0 or later
```

### Optional: Set up local Postgres

```bash
# Run a Postgres container (useful for offline development)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15

# Connect
psql -h localhost -U postgres -c "SELECT 1;"
```

## gcloud (Google Cloud SDK)

gcloud is the CLI for Google Cloud Platform. Required for pulling secrets from GCP Secret Manager.

### Installation via Homebrew

```bash
brew install --cask google-cloud-sdk
```

### Installation via Direct Download

```bash
# Download macOS release
curl https://sdk.cloud.google.com > install.sh
bash install.sh --usage-reporting=false --path-update=true

# Activate gcloud in current shell
. "$HOME/google-cloud-sdk/path.zsh.inc"
```

### Verification

```bash
gcloud --version
# Expected: Google Cloud SDK version X.X.X
```

### Post-Installation

```bash
gcloud auth login
# Browser opens, log in with your GCP account

gcloud config set project brickston-v2
# Sets default project for gcloud commands
```

## Text Editor / IDE (Your Choice)

While not required, a good editor makes development faster:

### Recommended Options

1. **VS Code** (free, popular)
   ```bash
   brew install visual-studio-code
   ```

2. **Cursor** (AI-powered, recommended)
   - Download from https://www.cursor.sh
   - Similar to VS Code but includes Claude integration

3. **JetBrains WebStorm** (paid, full-featured)
   ```bash
   brew install webstorm
   ```

### Extensions (for VS Code or Cursor)

- **TypeScript Vue Plugin** — for .vue files
- **Prettier** — code formatting
- **ESLint** — linting
- **GitLens** — Git history
- **Neon CLI** — Neon database connection
- **PostCSS IntelliSense** — CSS module hints

## macOS System Requirements

Ensure your macOS is up to date:
```bash
softwareupdate -a -i -R
# Installs all available updates
```

### Minimum Versions

- macOS Ventura (13.x) or later
- Xcode Command Line Tools (installed via `xcode-select --install`)

## Installation Checklist

Run through this checklist to verify all tools are installed:

```bash
# 1. GitHub CLI
gh --version

# 2. Node.js (via mise)
node --version

# 3. Python (via mise)
python --version

# 4. npm
npm --version

# 5. Vercel CLI
vercel --version

# 6. Flyctl
flyctl version

# 7. gcloud
gcloud --version

# 8. Docker (optional)
docker --version

# 9. mise
mise --version
```

All outputs should show version numbers (no "command not found" errors).

## Troubleshooting Installation

### Issue 1: "mise not found" after installation
**Fix:**
```bash
# Add to PATH
export PATH="$HOME/.local/share/mise/shims:$PATH"
source ~/.zshrc
```

### Issue 2: "gh command not found"
**Fix:**
```bash
# Verify Homebrew installation
brew list gh

# If missing, reinstall
brew install gh

# Add to PATH if needed
which gh
```

### Issue 3: "Python version is 3.10, not 3.11"
**Fix:**
```bash
# Use mise to manage Python
mise use python@3.11
python --version
```

### Issue 4: "gcloud auth fails in CI/CD"
**Fix:**
```bash
# Authenticate with service account instead
gcloud auth activate-service-account --key-file=/path/to/key.json
```

## Next Steps

- Run the **Setup** guide to clone the monorepo and verify everything works
- Read the **Logins** guide for Clerk, GCP, and other authentication details
- Pick an app from the **Apps** section and start developing
