import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import InvoicePDF from '@/components/admin/InvoicePDF'
import React from 'react'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(
        `*, order:orders(*, client:clients(*), order_items(*, packaging:packagings(*, product:products(*))))`
      )
      .eq('id', params.id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    const buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoice, order: invoice.order as any })
    )

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
