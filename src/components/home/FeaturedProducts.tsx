import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'
import { PRODUCT_IMAGES } from '@/lib/mockData'

const products = [
  {
    id: '1',
    name: 'Super M7 5W-30',
    type: '100% Synthétique',
    desc: "L'équilibre parfait entre performance, protection et polyvalence. Le choix idéal pour la majorité des véhicules modernes.",
    viscosity: '5W-30',
    badge: 'Le + vendu',
    image: PRODUCT_IMAGES['5w30'],
  },
  {
    id: '2',
    name: 'Super M7 5W-40',
    type: '100% Synthétique',
    desc: 'Protection renforcée à haute température. Conçue pour les conditions exigeantes : moteurs turbo et flottes intensives.',
    viscosity: '5W-40',
    badge: 'Haute protection',
    image: PRODUCT_IMAGES['5w40'],
  },
  {
    id: '3',
    name: 'Super M7 5W-20',
    type: '100% Synthétique',
    desc: 'Fluidité à froid et protection à chaud. Parfaite pour les moteurs récents exigeant une faible viscosité.',
    viscosity: '5W-20',
    badge: 'Économie carburant',
    image: PRODUCT_IMAGES['5w20'],
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-14 sm:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <p className="section-subtitle">Notre gamme</p>
            <h2 className="section-title mb-0">Produits phares</h2>
            <div className="gold-line mt-3" />
          </div>
          <Link
            href="/produits"
            className="text-brand-gold hover:text-brand-gold-light font-semibold flex items-center gap-2 transition-colors"
          >
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="card-dark border-l-4 border-l-brand-gold hover:bg-zinc-800 transition-colors group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/20">
                  {p.badge}
                </span>
                <span className="text-zinc-500 text-xs font-mono border border-zinc-700 px-2 py-1 rounded">
                  {p.viscosity}
                </span>
              </div>

              {/* Product image */}
              <div className="w-full h-44 rounded-xl mb-4 overflow-hidden relative bg-zinc-800 border border-zinc-700">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-brand-cream font-black text-lg mb-1">{p.name}</h3>
              <p className="text-brand-gold text-sm font-semibold mb-3">{p.type}</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">{p.desc}</p>
              <div className="flex gap-3 mt-auto">
                <a
                  href={getWhatsAppLink(`Bonjour, je souhaite un devis pour l'huile ${p.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary text-sm py-2 justify-center"
                >
                  Devis WhatsApp
                </a>
                <Link href={`/produits/${p.id}`} className="btn-secondary text-sm py-2 px-4">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
