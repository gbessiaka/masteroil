import { MapPin, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export default function ContactSection() {
  return (
    <section className="py-12 sm:py-16 bg-brand-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Prêt à commander ?
            </h2>
            <p className="text-white/80 font-medium text-sm sm:text-base">
              Contactez-nous dès maintenant pour un devis rapide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-gold hover:bg-gray-50 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm whitespace-nowrap"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              Commander sur WhatsApp
            </a>
            <div className="flex items-center justify-center gap-2 text-white font-bold py-3 px-6 bg-white/20 rounded-lg text-sm whitespace-nowrap">
              <MapPin className="w-4 h-4 shrink-0" />
              Kountia, République de Guinée
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
