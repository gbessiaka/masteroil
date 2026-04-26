import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, address, notes, cart, total } = await req.json()

    if (!name || !phone || !address || !cart?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Trouver ou créer le client
    let clientId: string
    const { data: existing } = await admin
      .from('clients')
      .select('id')
      .eq('phone', phone.trim())
      .maybeSingle()

    if (existing) {
      clientId = existing.id
      await admin.from('clients').update({ name: name.trim() }).eq('id', clientId)
    } else {
      const { data: newClient, error: clientErr } = await admin
        .from('clients')
        .insert({ name: name.trim(), phone: phone.trim(), client_type: 'particulier' })
        .select('id')
        .single()
      if (clientErr || !newClient) {
        return NextResponse.json({ error: 'Erreur lors de la création du client' }, { status: 500 })
      }
      clientId = newClient.id
    }

    // Créer la commande
    const fullNotes = [address.trim() ? `Adresse : ${address.trim()}` : '', notes?.trim()].filter(Boolean).join('\n')
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({ client_id: clientId, status: 'nouveau', total_gnf: total, notes: fullNotes || null })
      .select('id')
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
    }

    // Créer les articles
    const { error: itemsErr } = await admin.from('order_items').insert(
      cart.map((i: any) => ({
        order_id: order.id,
        packaging_id: i.packaging.id,
        quantity: i.quantity,
        unit_price_gnf: i.packaging.price_gnf,
      }))
    )

    if (itemsErr) {
      return NextResponse.json({ error: "Erreur lors de l'enregistrement des articles" }, { status: 500 })
    }

    return NextResponse.json({ orderId: order.id })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
