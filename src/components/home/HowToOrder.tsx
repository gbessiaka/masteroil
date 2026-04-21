import Link from 'next/link'
import { ShoppingCart, ClipboardList, Truck } from 'lucide-react'

const steps = [
  {
    icon: ShoppingCart,
    title: 'Choisissez vos produits',
    desc: 'Parcourez le catalogue, sélectionnez le format et la quantité qui vous convient.',
  },
  {
    icon: ClipboardList,
    title: 'Remplissez vos infos',
    desc: 'Saisissez votre nom et votre numéro de téléphone. Pas de compte, pas de mot de passe.',
  },
  {
    icon: Truck,
    title: 'Livraison à domicile',
    desc: 'On vous contacte pour confirmer et livrer rapidement à Conakry ou en région.',
  },
]

export default function HowToOrder() {
  return (
    <section className="py-14 sm:py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-subtitle">Simple et rapide</p>
          <h2 className="section-title">Comment commander ?</h2>
          <div className="gold-line mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mb-12">
          {/* Ligne de connexion desktop */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-brand-gold/20 via-brand-gold/40 to-brand-gold/20" />

          {steps.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center hover:shadow-md hover:border-brand-gold/30 transition-all group">
              <div className="relative inline-flex mb-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-brand-gold/20 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <s.icon className="w-7 h-7 text-brand-gold" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-gold text-white text-xs font-black flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-gray-900 font-bold text-xl mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/commande" className="btn-primary text-base py-4 px-10 shadow-sm">
            <ShoppingCart size={18} />
            Passer une commande
          </Link>
        </div>
      </div>
    </section>
  )
}
