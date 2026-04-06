import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Target, Heart, Globe, ArrowRight } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'À Propos | Master Oil Guinée',
  description:
    "Découvrez l'histoire de Master Oil Guinée, distributeur exclusif de Master Oil Canada en République de Guinée.",
}

const values = [
  {
    icon: Shield,
    title: 'Qualité sans compromis',
    desc: 'Nous ne commercialisons que des produits certifiés, importés directement du fabricant canadien. Chaque lot est contrôlé et authentifié avant distribution.',
  },
  {
    icon: Target,
    title: 'Disponibilité permanente',
    desc: 'Notre stock local à Conakry garantit une disponibilité continue. Fini les ruptures et les délais d\'attente pour un produit de qualité.',
  },
  {
    icon: Heart,
    title: 'Service client dédié',
    desc: 'Notre équipe est disponible sur WhatsApp, par téléphone ou en personne pour vous conseiller et vous accompagner dans le choix du bon produit.',
  },
  {
    icon: Globe,
    title: 'Partenariat international',
    desc: 'Distributeur exclusif autorisé par Canada Master Oil, nous bénéficions d\'un accès direct aux formules les plus avancées du marché mondial.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-20 bg-[#F0EDE8] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #C8952A 0, #C8952A 1px, transparent 0, transparent 50%)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="section-subtitle">Notre histoire</p>
            <h1 className="section-title text-3xl sm:text-5xl md:text-6xl">
              Master Oil Guinée
            </h1>
            <div className="gold-line mb-6" />
            <p className="text-xl text-gray-700 leading-relaxed">
              Fondée à Conakry, Master Oil Guinée est née d&apos;une conviction simple :{' '}
              <span className="text-brand-gold font-semibold">
                les moteurs guinéens méritent la meilleure protection possible
              </span>
              . Nous avons donc établi un partenariat exclusif avec Canada Master Oil pour
              importer directement leurs huiles synthétiques Super M7.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-subtitle">Notre mission</p>
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                Protéger les moteurs guinéens
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  En Guinée, les conditions climatiques (chaleur extrême, routes difficiles,
                  démarrages fréquents) soumettent les moteurs à des contraintes bien
                  supérieures à celles des pays tempérés. Pourtant, l&apos;offre en huiles
                  moteur de qualité certifiée reste insuffisante.
                </p>
                <p>
                  Master Oil Guinée a été créée pour changer cette réalité. Nous importons
                  directement du Canada l&apos;huile Super M7, une formule synthétique conçue
                  pour résister aux températures extrêmes et prolonger la durée de vie des
                  moteurs.
                </p>
                <p>
                  Notre clientèle couvre tous les segments : particuliers, garages mécaniques,
                  flottes d&apos;entreprise, stations-service, ONG et industries minières. Nous
                  proposons des tarifs adaptés à chaque volume de commande.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-gold/10 to-transparent border border-brand-gold/20 rounded-2xl p-8">
              <h3 className="text-gray-900 font-black text-2xl mb-6">
                Notre vision
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Devenir la référence incontournable en matière de lubrifiants moteur en
                République de Guinée, et contribuer au développement d&apos;un parc
                automobile mieux entretenu et plus fiable.
              </p>
              <div className="border-t border-brand-gold/20 pt-6">
                <p className="text-brand-gold font-bold text-lg mb-1">
                  &ldquo;Fiabilité. Performance. Disponibilité.&rdquo;
                </p>
                <p className="text-gray-400 text-sm">— La promesse Master Oil Guinée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-20 bg-[#F0EDE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Nos engagements</p>
            <h2 className="section-title">Ce qui nous définit</h2>
            <div className="gold-line mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="card-dark hover:border-brand-gold/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center mb-4 group-hover:bg-brand-gold/20 transition-colors">
                  <v.icon className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusivity section */}
      <section className="py-12 sm:py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-subtitle">Distributeur officiel</p>
            <h2 className="section-title">Partenaire exclusif Super M7 en Guinée</h2>
            <div className="gold-line mx-auto mb-6" />
            <p className="text-gray-500 leading-relaxed mb-8">
              Master Oil Guinée est le distributeur exclusif autorisé par{' '}
              <a
                href="https://canadamasteroil.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:text-brand-gold-light font-semibold transition-colors"
              >
                Canada Master Oil
              </a>{' '}
              pour la République de Guinée. Cette exclusivité nous permet de garantir
              l&apos;authenticité de chaque produit vendu et d&apos;offrir les meilleures
              conditions tarifaires à nos clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={getWhatsAppLink('Bonjour, je souhaite en savoir plus sur Master Oil Guinée et vos produits.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary justify-center"
              >
                Nous contacter <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/produits" className="btn-secondary justify-center">
                Voir nos produits
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
