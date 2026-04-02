import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, message } = body

    if (!name || !message) {
      return NextResponse.json({ error: 'Nom et message requis' }, { status: 400 })
    }

    // En mode démo — les messages sont acceptés sans base de données
    // Connectez Supabase pour sauvegarder les demandes de contact
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
