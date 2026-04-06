import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export default function MapSection() {
  return (
    <section className="bg-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Info */}
          <div>
            <p className="section-subtitle">Où nous trouver</p>
            <h2 className="section-title">Notre adresse</h2>
            <div className="gold-line mb-8" />

            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm mb-0.5">Adresse</p>
                  <p className="text-gray-600 text-sm">Kountia, République de Guinée</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm mb-0.5">WhatsApp</p>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 text-sm hover:text-brand-gold transition-colors"
                  >
                    +224 620 00 00 00
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm mb-1">Horaires</p>
                  <div className="space-y-0.5 text-sm text-gray-600">
                    <p>Lun — Ven : 08h00 à 18h00</p>
                    <p>Samedi : 08h00 à 13h00</p>
                    <p className="text-gray-400">Dimanche : Fermé</p>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm mb-0.5">Téléphone</p>
                  <a href="tel:+224620000000" className="text-gray-600 text-sm hover:text-brand-gold transition-colors">
                    +224 620 00 00 00
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-80 sm:h-[420px] w-full">
            <iframe
              title="Master Oil Guinée — Kountia"
              src="https://maps.google.com/maps?q=9.6822,-13.5145&z=16&output=embed&hl=fr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
