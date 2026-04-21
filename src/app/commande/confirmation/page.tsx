'use client'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { LOGO_URL } from '@/lib/mockData'
import { Suspense } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const name = params.get('name') ?? 'Client'
  const orderId = params.get('order') ?? ''

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-400" />
        </div>

        <h1 className="text-2xl font-black text-brand-cream mb-2">Commande reçue !</h1>
        <p className="text-zinc-400 mb-1">Merci <span className="text-brand-cream font-semibold">{name}</span>,</p>
        <p className="text-zinc-400 text-sm mb-6">
          Votre commande a bien été enregistrée. Notre équipe vous contactera sous peu pour confirmer la livraison.
        </p>

        {orderId && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-8 inline-block">
            <p className="text-zinc-500 text-xs mb-1">Référence commande</p>
            <p className="text-brand-gold font-mono font-bold text-sm">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}

        <Link href="/commande"
          className="block w-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-semibold py-3 rounded-xl text-sm hover:bg-brand-gold/20 transition-colors">
          Passer une nouvelle commande
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
