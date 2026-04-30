import { Shield, Thermometer, MapPin, Handshake } from 'lucide-react'

const reasons = [
  {
    icon: Shield,
    title: 'Qualité Canadienne Certifiée',
    description: "Nos huiles sont fabriquées selon les normes les plus strictes de l'industrie canadienne. Certifiées API et ACEA.",
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Thermometer,
    title: 'Résistance Extrême à la Chaleur',
    description: 'Formulée pour résister aux températures élevées caractéristiques du climat guinéen. Viscosité maintenue même en chaleur intense.',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    icon: MapPin,
    title: 'Disponible à Conakry',
    description: 'En stock permanent à Conakry avec livraison rapide. Votre commande est traitée sous 24h.',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    icon: Handshake,
    title: 'Service B2B Dédié',
    description: 'Tarifs spéciaux pour les garages, flottes et entreprises. Facturation professionnelle et support commercial personnalisé.',
    color: 'text-brand-gold',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
]

export default function WhyMasterOil() {
  return (
    <section className="py-14 sm:py-20 bg-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-brand-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Pourquoi nous choisir
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Pourquoi choisir Master Oil Guinée ?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Nous sommes plus qu&apos;un distributeur. Nous sommes votre partenaire pour la
            longévité de vos véhicules et équipements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <div
                key={reason.title}
                className={`group relative p-6 rounded-2xl border bg-white hover:border-brand-gold/40 hover:shadow-md transition-all duration-300 shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-xl ${reason.bg} border ${reason.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className={reason.color} />
                </div>
                <h3 className="text-gray-900 font-bold text-base mb-3 group-hover:text-brand-gold transition-colors duration-200">
                  {reason.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

