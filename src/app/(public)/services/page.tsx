import type { Metadata } from 'next'
import { Truck, Package, Users, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services',
  description:
    "Distribution, vente en gros et détail, livraison et accompagnement B2B d'huiles moteur synthétiques Super M7 à Conakry et en Guinée.",
  keywords: [
    'distribution huile moteur guinée',
    'vente gros huile conakry',
    'livraison lubrifiant guinée',
    'service b2b huile moteur',
    'super m7 guinée services',
  ],
  openGraph: {
    title: 'Services — Master Oil Guinée',
    description:
      "Distribution, vente en gros et détail, livraison et accompagnement B2B d'huiles moteur Super M7 à Conakry.",
    url: 'https://www.masteroilguinee.com/services',
  },
  alternates: {
    canonical: 'https://www.masteroilguinee.com/services',
  },
}

const services = [
  {
    icon: Package,
    title: 'Importation & Distribution',
    desc: 'Nous importons directement du Canada les huiles Super M7 en grandes quantités et assurons leur distribution en Guinée. Stock permanent à Conakry pour éviter toute rupture.',
    points: [
      'Import direct du fabricant canadien',
      'Stock local permanent à Conakry',
      'Disponibilité continue toute l\'année',
      'Produits certifiés et authentiques',
    ],
  },
  {
    icon: Truck,
    title: 'Vente en gros & détail',
    desc: 'Que vous soyez un particulier cherchant 1 litre ou une entreprise commandant des centaines de bidons, nous avons une offre adaptée. Conditionnements disponibles : 1L, 4L, 5L.',
    points: [
      'Vente au détail pour particuliers',
      'Prix de gros pour revendeurs',
      'Conditionnements 1L, 4L, 5L',
      'Devis personnalisé sur demande',
    ],
  },
  {
    icon: Truck,
    title: 'Livraison locale',
    desc: 'Nous livrons à domicile à Conakry et dans les villes secondaires de Guinée. Délai rapide, suivi de commande, livraison sécurisée pour préserver la qualité des produits.',
    points: [
      'Livraison à domicile à Conakry',
      'Déploiement dans les villes secondaires',
      'Emballage sécurisé et soigné',
      'Suivi de commande en temps réel',
    ],
  },
  {
    icon: Users,
    title: 'Accompagnement B2B',
    desc: 'Service dédié pour les professionnels : garages, flottes, ONG, industries. Contrats de fourniture, tarifs négociés, livraisons programmées, facturation adaptée.',
    points: [
      'Contrats de fourniture à long terme',
      'Tarifs négociables selon volume',
      'Livraisons planifiées',
      'Facturation professionnelle',
    ],
  },
]

const b2bSegments = [
  {
    icon: Building2,
    title: 'Stations-service',
    desc: 'Approvisionnement régulier pour vos stocks, prix de partenaire, support marketing.',
  },
  {
    icon: Users,
    title: 'Garages mécaniques',
    desc: 'Tarifs préférentiels pour les ateliers, recommandations techniques, livraison rapide.',
  },
  {
    icon: Truck,
    title: 'Flottes d\'entreprise',
    desc: 'Contrats de fourniture pour flottes de véhicules légers et poids lourds.',
  },
  {
    icon: Package,
    title: 'ONG & Organisations',
    desc: 'Solutions adaptées pour l\'entretien de flottes humanitaires et véhicules tout-terrain.',
  },
  {
    icon: Building2,
    title: 'Industries & Mines',
    desc: 'Gamme industrielle et conditionnements adaptés aux besoins des sites miniers.',
  },
  {
    icon: Users,
    title: 'Revendeurs distributeurs',
    desc: 'Programme partenaire pour revendeurs locaux avec marges attractives.',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#F0EDE8] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-subtitle">Ce que nous offrons</p>
            <h1 className="section-title text-5xl md:text-6xl">
              Nos services
            </h1>
            <div className="gold-line mb-6" />
            <p className="text-xl text-gray-700 leading-relaxed">
              De l&apos;importation à la livraison, Master Oil Guinée vous offre une solution
              complète pour vos besoins en huiles moteur synthétiques de qualité canadienne.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <div key={i} className="card-dark hover:border-brand-gold/30 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-black text-xl mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {s.points.map((point, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-700 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B section */}
      <section className="py-20 bg-[#F0EDE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Offres professionnelles</p>
            <h2 className="section-title">Solutions B2B</h2>
            <div className="gold-line mx-auto mb-6" />
            <p className="text-gray-500 max-w-2xl mx-auto">
              Master Oil Guinée propose des offres spécifiques pour chaque segment
              professionnel. Contactez-nous pour discuter d&apos;un partenariat adapté à
              votre activité.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {b2bSegments.map((seg, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 hover:border-brand-gold/30 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors">
                    <seg.icon className="w-5 h-5 text-brand-gold" />
                  </div>
                  <h3 className="text-gray-900 font-bold">{seg.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="section-title">Prêt à démarrer un partenariat ?</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Que vous ayez besoin d&apos;un devis ponctuel ou d&apos;un contrat de fourniture
            à long terme, notre équipe est disponible pour vous répondre rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppLink(
                'Bonjour, je souhaite discuter d\'un partenariat commercial avec Master Oil Guinée.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary justify-center py-4 px-8"
            >
              Discuter sur WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/contact" className="btn-secondary justify-center py-4 px-8">
              Formulaire de contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
