import { MessageCircle, FileText, Truck } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

const steps = [
  {
    icon: MessageCircle,
    num: '01',
    title: 'Contactez-nous',
    desc: 'Via WhatsApp, formulaire en ligne ou par téléphone. Décrivez vos besoins.',
  },
  {
    icon: FileText,
    num: '02',
    title: 'Recevez votre devis',
    desc: 'Nous vous envoyons un devis détaillé sous 24h avec prix et disponibilité.',
  },
  {
    icon: Truck,
    num: '03',
    title: 'Livraison à domicile',
    desc: 'Livraison rapide à votre adresse à Conakry ou dans les villes secondaires.',
  },
]

export default function HowToOrder() {
  return (
    <section className="py-14 sm:py-20 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-subtitle">Simple et rapide</p>
          <h2 className="section-title">Comment commander ?</h2>
          <div className="gold-line mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-gold/0 via-brand-gold/50 to-brand-gold/0" />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-brand-gold" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-gold text-brand-black text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-brand-cream font-bold text-xl mb-3">{s.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg py-4 px-10"
          >
            Démarrer ma commande
          </a>
        </div>
      </div>
    </section>
  )
}
