import puppeteer, { Browser } from 'puppeteer'

export async function generatePDF(): Promise<Uint8Array> {
  let browser: Browser | undefined
  try {
    const args = []
    // Only use sandbox flags in non-macOS environments (serverless)
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      args.push('--no-sandbox', '--disable-setuid-sandbox')
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 1024 })

    const baseURL = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await page.goto(`${baseURL}/docs`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
    })

    return pdf
  } catch (error) {
    // Re-throw to be caught by the API route handler
    throw error
  } finally {
    if (browser) {
      try {
        await browser.close()
      } catch {
        // Ignore close errors
      }
    }
  }
}
