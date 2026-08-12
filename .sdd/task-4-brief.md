# Task 4: Implement PDF Generation Endpoint

## Overview
Create an HTTP endpoint that generates a downloadable PDF of the entire onboarding manual using Puppeteer. When a user clicks "Download PDF" in the Header, they get a snapshot of the documentation site as a PDF file.

## Files to Create/Modify

**API route:**
- `src/app/api/pdf/route.ts` — HTTP GET endpoint that generates and returns PDF

**Utilities:**
- `src/lib/pdf-generator.ts` — Puppeteer logic (headless browser, page rendering, PDF generation)

**Component update:**
- `src/components/layout/Header.tsx` — Update "PDF" link to point to `/api/pdf` with download attribute

**Configuration updates:**
- `package.json` — Add puppeteer as dependency

## Implementation Details

### PDF Generation Endpoint (`src/app/api/pdf/route.ts`)

**Route:** `GET /api/pdf`

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="lfiq-onboarding-manual.pdf"`
- Cache-Control: `max-age=3600, public` (cache for 1 hour)
- Body: PDF blob (binary)

**Error handling:**
- If Puppeteer fails: return 500 with JSON error message
- If rendering times out: return 504 Gateway Timeout

**Implementation:**
```typescript
import { generatePDF } from '@/lib/pdf-generator'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pdf = await generatePDF()
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="lfiq-onboarding-manual.pdf"',
        'Cache-Control': 'max-age=3600, public',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
```

### PDF Generator (`src/lib/pdf-generator.ts`)

**Export function:**
```typescript
export async function generatePDF(): Promise<Buffer>
```

**Logic:**
1. Launch headless browser (Puppeteer)
2. Create new page
3. Set viewport (1280x1024 for consistent rendering)
4. Navigate to `/docs` (or full onboarding.lfiq.app/docs in production)
5. Wait for network idle (networkidle0)
6. Generate PDF with options:
   - Format: A4
   - Margins: 20mm (top/bottom), 15mm (left/right)
   - printBackground: true (preserve colors)
   - timeout: 30 seconds
7. Close browser
8. Return PDF buffer

**Environment handling:**
- Development: Use http://localhost:3000/docs
- Production (Vercel): Use https://onboarding.lfiq.app/docs

**Error handling:**
- Browser launch failure: throw error
- Navigation timeout: throw error
- PDF generation failure: throw error
- Always close browser in finally block

**Sample implementation:**
```typescript
import puppeteer from 'puppeteer'

export async function generatePDF(): Promise<Buffer> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.createPage()
    await page.setViewport({ width: 1280, height: 1024 })

    const baseURL = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await page.goto(`${baseURL}/docs`, {
      waitUntil: 'networkidle0',
    })

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
      timeout: 30000,
    })

    return pdf
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
```

### Header Update

Update `src/components/layout/Header.tsx` to link to `/api/pdf`:

```typescript
<a
  href="/api/pdf"
  download="lfiq-onboarding-manual.pdf"
  className="..."
>
  📥 PDF
</a>
```

## Dependencies

**Add to package.json:**
```json
{
  "dependencies": {
    "puppeteer": "^21.0.0"
  }
}
```

## Success Criteria

- [ ] `/api/pdf` endpoint created and returns PDF
- [ ] PDF contains all doc pages (full site snapshot)
- [ ] PDF is properly formatted (A4, margins, colors)
- [ ] Header "PDF" link points to `/api/pdf` with download attribute
- [ ] Error handling works: invalid requests return proper error responses
- [ ] Caching works: subsequent requests use cached PDF (1 hour)
- [ ] TypeScript compilation succeeds
- [ ] No console errors or warnings
- [ ] PDF is downloadable and opens correctly in viewers

## Testing

**Local development:**
```bash
npm install
npm run dev
# Navigate to http://localhost:3000
# Click "PDF" link in header
# Verify PDF downloads and opens correctly
```

**Vercel deployment:**
```bash
vercel deploy --prod
# Visit https://onboarding.lfiq.app/
# Click "PDF" link
# Verify PDF downloads and opens correctly
```

## Notes

- Puppeteer headless browser uses ~100MB RAM
- PDF generation takes ~5-10 seconds (depends on page size)
- For large-scale usage, consider external PDF service (but not needed for onboarding manual)
- Caching (1 hour) reduces load on server
- `--no-sandbox` flag required for Cloud Run / serverless environments

## Self-Review Before Committing

- [ ] PDF endpoint created and tested locally
- [ ] PDF downloads with correct filename
- [ ] Header PDF link works
- [ ] Puppeteer is properly installed (`npm ls puppeteer`)
- [ ] Error handling works (try with network off)
- [ ] TypeScript: `npm run type-check` passes
- [ ] Build: `npm run build` succeeds
- [ ] No console errors when generating PDF
- [ ] PDF file size is reasonable (~1-3MB for full manual)
