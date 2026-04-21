import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const typeLabels: Record<string, string> = {
  particulier: 'Particulier',
  garage: 'Garage / Atelier mécanique',
  entreprise: 'Entreprise / Flotte / Organisation',
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, message, request_type } = await req.json()

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Nom et message requis' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Contact Master Oil <onboarding@resend.dev>',
      to: ['info@masteroilguinee.com'],
      replyTo: email || undefined,
      subject: `Nouveau message — ${typeLabels[request_type] ?? request_type} — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C8952A; padding: 20px 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Master Oil Guinée — Nouveau message</h1>
          </div>
          <div style="padding: 24px; background: #f9f9f9; border: 1px solid #e5e5e5;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px; width: 140px;"><strong>Nom</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${name}</td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Téléphone</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${phone}</td>
              </tr>` : ''}
              ${email ? `<tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Email</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${email}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;"><strong>Type</strong></td>
                <td style="padding: 8px 0; font-size: 14px;">${typeLabels[request_type] ?? request_type}</td>
              </tr>
            </table>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Message :</p>
            <p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          <div style="padding: 16px 24px; background: #f0f0f0; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">Master Oil Guinée — Conakry</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
