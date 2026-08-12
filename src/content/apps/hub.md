# Hub App Guide

Hub is the entry point to the LFIQ platform. It hosts the document index, Brick chat interface, and central navigation to all other LFIQ applications.

## What It Does

Hub is a unified gateway into the LFIQ ecosystem. New users land on Hub, authenticate via Clerk, and then navigate to specific apps (Intel for data, Command for portfolio management, etc.). Hub also hosts the Brick chat interface, an AI-powered assistant powered by Anthropic's Claude that can answer questions about properties, market data, and internal documents.

**Primary features:**
- Public splash page (unauthenticated)
- User authentication (Clerk)
- Document index (Properties, deals, reports, market data)
- Brick chat (AI assistant)
- App navigation (links to Intel, Command, Keystone, Registry, Stacks, Sticks)
- User profile & settings

## Deployment

| Environment | URL | Status | Platform |
|-------------|-----|--------|----------|
| **Production** | https://hub.lfiq.app | Live, auto-deploy on git push to main | Vercel |
| **Preview** | https://hub-branch.lfiq.app | Auto-deploy on PR | Vercel |
| **Local Dev** | http://localhost:3000 | Via `npm run dev` | Local machine |
| **Staging** | (none, use preview) | — | — |

## Tech Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **Framework** | Next.js 15 | React 19, App Router |
| **Language** | TypeScript | Full type coverage |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Auth** | Clerk + Cloud Run proxy | OAuth via accounts.lfiq.app |
| **Backend** | Cloud Run | Python FastAPI, OIDC token validation |
| **Database** | Neon (read-only) | Portfolio schema, read access |
| **Chat Proxy** | Cloud Run | Anthropic API (Claude models) |
| **Deployment** | Vercel | Automatic on git push |

## Local Development

### Start the App

```bash
cd /path/to/02-brick.apps/apps/hub
npm run dev
```

Expected output:
```
▲ Next.js 15.0.0
- Local: http://localhost:3000
- Environments: .env.local
```

### Open in Browser

Navigate to http://localhost:3000. You should see:
- **Unauthenticated state:** Hero image, headline, "Sign in" button
- **After sign-in:** Document index, Brick chat, navigation sidebar

### Hot Reload

Changes to `.tsx` and `.ts` files auto-reload. No manual restart needed.

## Environment Variables

| Variable | Required? | Default | Purpose |
|----------|-----------|---------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | — | Clerk OAuth client ID |
| `CLERK_SECRET_KEY` | Yes | — | Clerk signing key (backend only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | `/sign-in` | Sign-in page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No | `/` | Redirect after login |
| `NEXT_PUBLIC_API_URL` | Yes | — | Backend API base (Cloud Run) |
| `ANTHROPIC_API_KEY` | Yes | — | Claude API key |
| `HUB_CHAT_PROXY_SA_JSON` | Yes | — | Cloud Run invoker SA (base64) |
| `DATABASE_URL` | No | — | Neon connection (optional, read-only) |

Pull from Vercel:
```bash
vercel env pull
```

Check all are set:
```bash
env | grep NEXT_PUBLIC_CLERK
env | grep ANTHROPIC
```

## Key Flows

### Flow 1: User Authentication
1. User visits hub.lfiq.app
2. Clerk middleware checks for session token
3. If not authenticated, redirect to `/sign-in`
4. User clicks "Sign in with Google" or "Sign in with Microsoft"
5. Redirect to accounts.lfiq.app (Clerk tenant)
6. OAuth provider login (Google or Microsoft)
7. Redirect back to hub.lfiq.app with session token
8. User lands on `/` (document index)

### Flow 2: Brick Chat Request
1. User opens chat panel on right sidebar
2. User types a question (e.g., "Show me vacancy rates for 123 Main")
3. Hub frontend sends POST to `/api/brick-chat/stream`
4. Backend Cloud Run service validates OIDC token
5. Request forwarded to Anthropic API with prompt + context
6. Claude responds with text (or images)
7. Response streamed back to frontend, displayed in chat UI

### Flow 3: Navigation to Other Apps
1. User clicks "Go to Intel" in the navigation menu
2. Clerk session is valid across all LFIQ domains
3. User is redirected to intel.lfiq.app
4. Intel app authenticates using same Clerk session
5. User lands on Intel inbox

## Troubleshooting

### Issue 1: "Sign in button does not appear"
**Symptom:** Hub splash page loads but sign-in button is missing  
**Cause:** Clerk frontend library not loaded, or CSS conflict  
**Fix:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check browser console for errors
# DevTools > Console, look for "Clerk" errors
```

### Issue 2: "After sign-in, redirect to blank page"
**Symptom:** User logs in but lands on empty page  
**Cause:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` misconfigured  
**Fix:**
```bash
# Verify in .env.local
grep AFTER_SIGN_IN_URL .env.local
# Should be: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

vercel env pull  # Refresh from Vercel
npm run dev
```

### Issue 3: "Chat button shows 'Error' state"
**Symptom:** Brick chat panel shows red error icon  
**Cause:** Cloud Run service down, Anthropic API key invalid, or OIDC token expired  
**Fix:**
```bash
# Check Cloud Run status
gcloud run services describe hub-chat-proxy --project=brickston-v2

# Check Anthropic API key is set
grep ANTHROPIC_API_KEY .env.local

# Clear browser cache and retry
# DevTools > Application > Clear Site Data
```

### Issue 4: "Neon connection timeout on document list"
**Symptom:** Document index takes 40+ seconds to load  
**Cause:** Neon cold start  
**Fix:**
```bash
# Warm Neon connection
psql -h ep-tiny-lab-akrddwgy.us-west-2.neon.tech -U intel neondb -c "SELECT 1;"

# Then reload page in browser
```

### Issue 5: "CORS error when calling /api/brick-chat/stream"
**Symptom:** Browser console shows "Cross-Origin Request Blocked"  
**Cause:** Cloud Run CORS headers misconfigured  
**Fix:**
```bash
# Check Cloud Run service configuration
gcloud run services describe hub-chat-proxy \
  --project=brickston-v2 \
  --format='value(status.conditions[0].message)'

# Verify headers are set
curl -i https://hub-chat-proxy.lfiq.app/health
# Should include: Access-Control-Allow-Origin: https://hub.lfiq.app
```

## Common Tasks

### Task 1: Update the Document Index
Hub displays a list of documents (properties, deals, reports) on the home page. To add a new document type:

```typescript
// apps/hub/app/documents/page.tsx
export const documents = [
  {
    id: 'properties',
    label: 'Properties',
    icon: 'Building2',
    href: '/command/properties',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: 'TrendingUp',
    href: '/registry/deals',
  },
  // Add new document type here
  {
    id: 'my-new-type',
    label: 'My New Type',
    icon: 'FileText',
    href: '/path/to/resource',
  },
];
```

Then restart: `npm run dev`

### Task 2: Change Brick Chat System Prompt
The Brick chat system prompt controls how Claude responds. It's stored in an environment variable:

```typescript
// apps/hub/app/api/brick-chat/route.ts
const SYSTEM_PROMPT = process.env.BRICK_CHAT_SYSTEM_PROMPT || `
You are Brick, an AI assistant for LFIQ...
`;
```

Update the prompt in Vercel:
```bash
vercel env add BRICK_CHAT_SYSTEM_PROMPT
# Paste new prompt
# Redeploy
git push origin main
```

### Task 3: Add a New Navigation Link
Hub's navigation menu links to other LFIQ apps. To add a new app:

```typescript
// apps/hub/components/AppFamilyMenu.tsx
const appLinks = [
  { label: 'Hub', href: 'https://hub.lfiq.app', icon: Home },
  { label: 'Intel', href: 'https://intel.lfiq.app', icon: Database },
  { label: 'Command', href: 'https://command.lfiq.app', icon: Settings },
  // Add new app link here
  { label: 'My App', href: 'https://myapp.lfiq.app', icon: IconComponent },
];
```

Restart: `npm run dev`

**Note:** AppFamilyMenu is a COPY in each app (not a shared component), so you must update it in all apps that use it.

## Deployment & CI/CD

### Automatic Deployment (Vercel)

Every push to main triggers an auto-deploy:
```bash
git push origin main
# Vercel automatically builds and deploys to https://hub.lfiq.app
```

Check deployment status:
```bash
vercel ls
# Shows all recent deployments
```

### Pull Request Previews

Pushing to a feature branch creates a preview deployment:
```bash
git push origin feature/my-feature
# Vercel creates a preview at https://hub-feature-my-feature.lfiq.app

# Or pull the latest build:
vercel list
# View preview URL
```

### Manual Deploy (Emergency)

If auto-deploy fails:
```bash
vercel deploy --prod
# Manually triggers production build
```

## Logs & Monitoring

### View Vercel Logs
```bash
vercel logs --follow
# Streams live logs from Vercel production
```

### View Clerk Logs
```bash
# Log in to Clerk Dashboard
# Navigate to Logs in the sidebar
# Filter by event type (sign-in, sign-out, error)
```

### View Cloud Run Logs (Chat Proxy)
```bash
gcloud run logs read hub-chat-proxy \
  --project=brickston-v2 \
  --limit=50
```

## Related Documentation

- **Getting Started:** Setup, Logins, Install Tools
- **Architecture:** System topology, auth model, deployment
- **Brick Chat Proxy:** Details on Cloud Run chat service
- **Clerk Documentation:** https://clerk.com/docs
- **Next.js 15:** https://nextjs.org/docs
