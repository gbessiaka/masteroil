import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4 text-center">
      {/* Gold line top */}
      <div className="w-16 h-1 bg-brand-gold rounded-full mb-8" />

      {/* 404 */}
      <p className="text-brand-gold font-black text-8xl md:text-9xl leading-none mb-4">404</p>

      <h1 className="text-gray-900 font-black text-2xl md:text-3xl mb-3">
        Page introuvable
      </h1>
      <p className="text-gray-500 text-base max-w-md mb-10">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil ou consultez notre catalogue.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/produits"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-brand-gold text-white hover:bg-brand-gold-dark transition-colors shadow-sm"
        >
          <Package className="w-4 h-4" />
          Voir les produits
        </Link>
        <Link
          href="/commande"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-brand-gold text-brand-gold hover:bg-amber-50 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Commander
        </Link>
      </div>

      <div className="w-16 h-1 bg-brand-gold rounded-full mt-12" />
    </div>
  )
}
