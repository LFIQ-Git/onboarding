# Task 5: Deploy to Vercel & Record Screencasts

## Overview
Final task: deploy the completed onboarding manual to Vercel at `onboarding.lfiq.app`, then record 4 screencasts demonstrating key workflows. Upon completion, the manual will be live and accessible to all new team members.

## Part 1: Deploy to Vercel

### Deployment Steps

1. **Create/Link Vercel Project**
   ```bash
   cd /Volumes/satopkm/justinsato/Projects/ACTIVE/02-onboarding-manual
   vercel login
   vercel link --project lfiq-onboarding --scope lfiq
   ```

2. **Deploy to Production**
   ```bash
   vercel deploy --prod
   ```
   - This builds and deploys to Vercel
   - Assigns `onboarding.lfiq.app` domain (already configured in Vercel org)
   - Pre-renders all 18 doc pages as static HTML
   - Deploys API routes (/api/pdf, etc.)

3. **Verify Deployment**
   - Visit https://onboarding.lfiq.app
   - Click through navigation (sidebar should work)
   - Click "Getting Started" → should render setup.md
   - Click on app (e.g., "Hub") → should render hub.md
   - Test PDF download: click "PDF" in header → should trigger download
   - Test dark mode toggle (if implemented; future enhancement)
   - Verify no 404 errors in browser console

4. **DNS Verification**
   - Domain `onboarding.lfiq.app` should already be configured in Vercel
   - If not, add CNAME record pointing to Vercel's DNS

### Success Criteria for Deployment

- [ ] `vercel deploy --prod` succeeds without errors
- [ ] App is live at https://onboarding.lfiq.app
- [ ] All doc pages render correctly
- [ ] PDF download works
- [ ] No console errors or 404s
- [ ] Dark mode works (if implemented)
- [ ] Mobile responsive design works on different screen sizes

---

## Part 2: Record Screencasts (Guide for User)

**Note:** Screencasts require manual recording and editing. Below is a guide for the user to record the 4 videos. The implementer can optionally record them, but they're time-consuming (~45 min total including editing).

### Screencast 1: Setup & Local Development (10 minutes)

**Purpose:** Walk new engineers through environment setup from clone to first dev server start.

**Outline:**
1. "Welcome to LFIQ setup. I'll show you how to get from zero to running locally in 10 minutes."
2. Clone the repo: `git clone https://github.com/LFIQ-Git/shared.onboarding.git`
3. Install Node 20 + Python 3.11: `mise install`
4. Install dependencies: `npm ci`
5. Pull environment variables: `vercel link` + `vercel env pull .env.local`
6. Verify setup: `npm run dev` → open http://localhost:3000
7. Show the landing page and navigate to Hub
8. "You're all set. You can now develop locally."

**Recording setup:**
- macOS QuickTime Player or ffmpeg
- Full screen (or main window)
- 480p+ resolution
- Audio: clear narration (no background noise)
- Duration: exactly 10 minutes (with intro/outro)

**File:** `public/videos/setup-and-local-dev.mp4` (~50-100MB, H.264)

---

### Screencast 2: Hub Login Flow (5 minutes)

**Purpose:** Show how to log in and navigate to other apps.

**Outline:**
1. "Hub is your entry point to LFIQ. Let me show you how to log in."
2. Navigate to https://onboarding.lfiq.app
3. Click "Sign In" → Google/Microsoft OAuth flow
4. Complete login
5. Show Hub dashboard
6. Click on "Command" in navigation → shows Command app
7. Go back to Hub
8. Show sidebar navigation with all 8 apps
9. "You're logged in and can now access all LFIQ apps."

**Recording setup:**
- Same as above
- Duration: 5 minutes (with intro/outro)

**File:** `public/videos/hub-login-flow.mp4` (~25-50MB)

---

### Screencast 3: Intel Data Ingestion (8 minutes)

**Purpose:** Show how Intel aggregates data from multiple sources.

**Outline:**
1. "Intel is where all our data converges. Let me show you the data sources."
2. Navigate to https://intel.lfiq.app or /docs/apps/intel
3. Show the architecture diagram (if on docs page)
4. Explain: "We pull from 14 sources: email, calendar, Smartsheet, PropertyRadar, DataTree, SF civic data..."
5. Show the data model (if accessible in app or docs)
6. Explain how data flows into the items schema
7. Show an example: "All of this feeds Command, Keystone, and other apps."

**Recording setup:**
- Same as above
- Can use docs pages or live app (whichever is clearer)
- Duration: 8 minutes

**File:** `public/videos/intel-data-ingestion.mp4` (~40-80MB)

---

### Screencast 4: Command Financials (7 minutes)

**Purpose:** Show portfolio management dashboard and workflows.

**Outline:**
1. "Command is the portfolio management hub. Let me show you a property."
2. Navigate to https://command.lfiq.app or /docs/apps/command
3. If in app: click into a sample property
4. Show financials/income statement view
5. Show rent roll and collections pipeline
6. Explain: "This backend runs on Fly.io, talks to our Neon database, pulls financial data from Power BI."
7. Show any repair dispatch or AR collections workflow
8. "This is where operators see the full property picture."

**Recording setup:**
- Same as above
- Duration: 7 minutes

**File:** `public/videos/command-financials.mp4` (~35-70MB)

---

### Recording & Processing Checklist

**Recording:**
- [ ] Screencast 1: Setup & Local Dev (10 min, <100MB)
- [ ] Screencast 2: Hub Login Flow (5 min, <50MB)
- [ ] Screencast 3: Intel Data Ingestion (8 min, <80MB)
- [ ] Screencast 4: Command Financials (7 min, <70MB)

**Processing:**
- [ ] Trim intro/outro
- [ ] Verify audio is clear
- [ ] Export as MP4 (H.264)
- [ ] Resolution: 480p or higher

**Upload:**
- [ ] Place all 4 videos in `public/videos/`
- [ ] Commit: `git add public/videos/*.mp4`
- [ ] Commit message: `videos: add onboarding screencasts (4 videos, 30 min total)`
- [ ] Push to main

---

## Files to Modify/Create

**Vercel deployment:**
- Create Vercel project (via `vercel link`)
- Configure domain (should already exist)

**Screencast files:**
- `public/videos/setup-and-local-dev.mp4` (10 min)
- `public/videos/hub-login-flow.mp4` (5 min)
- `public/videos/intel-data-ingestion.mp4` (8 min)
- `public/videos/command-financials.mp4` (7 min)

---

## Success Criteria

**Deployment:**
- [ ] Web app live at https://onboarding.lfiq.app
- [ ] All pages render without errors
- [ ] PDF download works
- [ ] Responsive design works

**Screencasts:**
- [ ] All 4 videos recorded and in `public/videos/`
- [ ] Total runtime: ~30 minutes
- [ ] Video quality: 480p+, clear audio
- [ ] Each video embedded in docs pages (via VideoEmbed component)
- [ ] Videos play without errors

**Final Verification:**
- [ ] Landing page loads
- [ ] Can navigate through all doc pages
- [ ] Sidebar navigation works
- [ ] Videos play (if embedded)
- [ ] PDF downloads correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works

---

## Testing Checklist

After deployment:
1. [ ] Open https://onboarding.lfiq.app
2. [ ] Click "Getting Started" → setup.md renders
3. [ ] Click "Apps" → "Hub" → hub.md renders
4. [ ] Click PDF link → PDF downloads
5. [ ] Open PDF → displays correctly
6. [ ] Test on mobile (responsive)
7. [ ] Test on tablet (responsive)
8. [ ] Test dark mode (if toggle added)
9. [ ] Check browser console for errors
10. [ ] All navigation links work

---

## Timeline

**Deployment:** 5 minutes (vercel deploy --prod)
**Screencast Recording:** ~45 minutes (recording + light editing)
**Testing:** 10 minutes
**Total: ~60 minutes**

---

## Notes

- Screencasts can be recorded in parallel by multiple team members
- Videos are optional for MVP but highly recommended for user experience
- If short on time, deployment alone (Part 1) is sufficient for the manual to be live
- Screencasts can be added later via a second commit

---

## Post-Deployment

Once deployed, the manual will be accessible at:
- **Web app:** https://onboarding.lfiq.app
- **PDF:** https://onboarding.lfiq.app/api/pdf (via header link)
- **Docs index:** https://onboarding.lfiq.app/docs
- **Individual docs:** https://onboarding.lfiq.app/docs/getting-started/setup, etc.

Share the link with new team members:
- Email: "Welcome to LFIQ. Start here: https://onboarding.lfiq.app"
- Slack: Pin the URL in #engineering or #onboarding channel
- Handbook: Add link to team wiki/handbook
