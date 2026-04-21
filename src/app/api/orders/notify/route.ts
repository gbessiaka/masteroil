import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtGNF(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF'
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, clientName, clientPhone, clientAddress, items, totalGnf } = await req.json()

    const itemsHtml = items.map((i: { name: string; volume: number; quantity: number; price: number }) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${i.name} ${i.volume}L</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">${fmtGNF(i.price * i.quantity)}</td>
      </tr>
    `).join('')

    const { error } = await resend.emails.send({
      from: 'Commandes Master Oil <onboarding@resend.dev>',
      to: ['saliouvj@gmail.com'], // TODO: remplacer par info@masteroilguinee.com après vérification du domaine
      subject: `Nouvelle commande #${orderId.slice(0, 8).toUpperCase()} — ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C8952A; padding: 20px 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nouvelle commande reçue</h1>
          </div>

          <div style="padding: 24px; background: #f9f9f9; border: 1px solid #e5e5e5;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 14px; width: 140px;"><strong>Référence</strong></td>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold;">#${orderId.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Client</strong></td>
                <td style="padding: 6px 0; font-size: 14px;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Téléphone</strong></td>
                <td style="padding: 6px 0; font-size: 14px;">${clientPhone}</td>
              </tr>
              ${clientAddress ? `<tr>
                <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Adresse</strong></td>
                <td style="padding: 6px 0; font-size: 14px;">${clientAddress}</td>
              </tr>` : ''}
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #555;">Produit</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 13px; color: #555;">Qté</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #555;">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #fff8ec;">
                  <td colspan="2" style="padding: 10px 12px; font-weight: bold; font-size: 14px;">TOTAL</td>
                  <td style="padding: 10px 12px; font-weight: bold; font-size: 16px; text-align: right; color: #C8952A;">${fmtGNF(totalGnf)}</td>
                </tr>
              </tfoot>
            </table>

            <a href="https://masteroil.vercel.app/admin/commandes/${orderId}"
              style="display: inline-block; background: #C8952A; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Voir la commande dans l'admin →
            </a>
          </div>

          <div style="padding: 16px 24px; background: #f0f0f0; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">Master Oil Guinée — Conakry</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend order notify error:', error)
      return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order notify API error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
