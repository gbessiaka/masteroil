import { MapPin, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export default function ContactSection() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '224620000000'
  return (
    <section className="py-16 bg-brand-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-brand-black mb-2">
              Prêt à commander ?
            </h2>
            <p className="text-brand-black/70 font-medium">
              Contactez-nous dès maintenant pour un devis rapide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-black text-brand-cream hover:bg-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <div className="flex items-center gap-2 text-brand-black font-bold py-3 px-6 bg-brand-black/10 rounded-lg">
              <MapPin className="w-5 h-5" />
              Conakry, Guinée
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
