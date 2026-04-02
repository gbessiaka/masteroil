import { Shield, Thermometer, MapPin, Handshake } from 'lucide-react'

const reasons = [
  {
    icon: Shield,
    title: 'Qualité Canadienne Certifiée',
    description:
      'Nos huiles Super M7 sont fabriquées selon les normes les plus strictes de l\'industrie canadienne. Certifiées API et ACEA, elles garantissent une protection optimale de votre moteur.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    icon: Thermometer,
    title: 'Résistance Extrême à la Chaleur',
    description:
      'Formulée pour résister aux températures élevées caractéristiques du climat guinéen. Notre huile synthétique maintient sa viscosité même en conditions de chaleur intense.',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  {
    icon: MapPin,
    title: 'Disponible à Conakry',
    description:
      'En stock permanent à Conakry avec livraison rapide. Fini les ruptures de stock d\'huiles de qualité. Votre commande est traitée sous 24h.',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  {
    icon: Handshake,
    title: 'Service B2B Dédié',
    description:
      'Tarifs spéciaux pour les garages, flottes et entreprises. Facturation professionnelle, livraison régulière et support commercial personnalisé pour vos besoins.',
    color: 'text-brand-gold',
    bgColor: 'bg-brand-gold/10',
  },
]

export function WhyMasterOil() {
  return (
    <section className="py-20 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Pourquoi nous choisir
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pourquoi choisir Master Oil Guinée ?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Nous sommes plus qu&apos;un distributeur. Nous sommes votre partenaire pour la
            longévité de vos véhicules et équipements.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <div
                key={reason.title}
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all duration-300"
              >
                {/* Gold left accent */}
                <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-brand-gold/0 group-hover:bg-brand-gold/60 transition-all duration-300 rounded-full" />

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${reason.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={24} className={reason.color} />
                </div>

                {/* Content */}
                <h3 className="text-white font-bold text-base mb-3 group-hover:text-brand-gold transition-colors duration-200">
                  {reason.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyMasterOil
