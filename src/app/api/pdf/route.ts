import { generatePDF } from '@/lib/pdf-generator'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pdf = await generatePDF()

    return new NextResponse(Buffer.from(pdf), {
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
