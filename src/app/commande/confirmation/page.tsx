'use client'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, ShoppingCart, Home } from 'lucide-react'
import { LOGO_URL } from '@/lib/mockData'
import { getWhatsAppLink } from '@/lib/utils'
import { Suspense } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const name = params.get('name') ?? 'Client'
  const orderId = params.get('order') ?? ''
  const ref = orderId.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-12 h-12">
            <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
          </div>
        </div>

        {/* Card principale */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center mb-4">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Commande reçue !</h1>
          <p className="text-gray-500 mb-1">
            Merci <span className="text-gray-900 font-semibold">{name}</span>,
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Votre commande a bien été enregistrée. Notre équipe vous contactera sous peu pour confirmer la livraison.
          </p>

          {orderId && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 inline-block">
              <p className="text-gray-400 text-xs mb-1">Référence commande</p>
              <p className="text-brand-gold font-mono font-black text-lg tracking-widest"># {ref}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={getWhatsAppLink(`Bonjour, je viens de passer la commande #${ref}. Pouvez-vous me confirmer la livraison ?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Suivre sur WhatsApp
          </a>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/commande"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-brand-gold text-white hover:bg-brand-gold-dark transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Nouvelle commande
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
