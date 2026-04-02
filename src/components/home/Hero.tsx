import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'
import { LOGO_URL, PRODUCT_IMAGES } from '@/lib/mockData'

const stats = [
  { value: '100%', label: 'Synthétique' },
  { value: 'Certifié', label: 'Canada' },
  { value: 'Livraison', label: 'Conakry' },
  { value: 'Service', label: 'B2B Dédié' },
]

export function Hero() {
  const whatsappLink = getWhatsAppLink('Bonjour Master Oil Guinée, je souhaite commander des huiles Super M7.')

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-brand-black">
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-gray-900 to-brand-black" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-gold/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-gold/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#C8952A 1px, transparent 1px), linear-gradient(90deg, #C8952A 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Two-column layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">

          {/* LEFT — Text content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 mb-8 w-fit">
              <CheckCircle2 size={14} className="text-brand-gold shrink-0" />
              <span className="text-brand-gold text-sm font-medium">
                Distributeur exclusif de Master Oil Canada en Guinée
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-6">
              L&apos;Huile Moteur
              <br />
              <span className="text-brand-gold">Synthétique</span>
              <br />
              <span className="text-brand-gold">Canadienne</span>
              <br />
              <span className="text-3xl sm:text-4xl xl:text-5xl font-bold text-gray-300">
                Disponible en Guinée
              </span>
            </h1>

            {/* Gold line */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-1 w-16 bg-brand-gold rounded-full" />
              <div className="h-1 w-8 bg-brand-gold/40 rounded-full" />
              <div className="h-1 w-4 bg-brand-gold/20 rounded-full" />
            </div>

            {/* Subtext */}
            <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-lg">
              Super M7, la marque canadienne de référence, importée directement pour protéger vos
              moteurs dans les conditions les plus exigeantes. Qualité certifiée, performance
              garantie, livraison à Conakry.
            </p>

            {/* CTAs */}
            <div className="flex flex-row items-center gap-3 mb-12 flex-wrap">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-gold text-white font-bold text-sm hover:bg-brand-gold-dark transition-all duration-200 group whitespace-nowrap"
              >
                <MessageCircle size={16} />
                Commander sur WhatsApp
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-white/30 text-white font-bold text-sm hover:border-brand-gold hover:text-brand-gold transition-all duration-200 group whitespace-nowrap"
              >
                Voir nos produits
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black text-brand-gold">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Product images */}
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Three bottles row */}
            <div className="flex items-end justify-center gap-5 w-full">
              <div className="relative w-52 h-72 rounded-3xl overflow-hidden border border-brand-gold/20 shadow-2xl rotate-[-4deg] translate-y-6 shrink-0">
                <Image
                  src={PRODUCT_IMAGES['5w30']}
                  alt="Super M7 5W30"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-black text-center">5W30</p>
                </div>
              </div>

              <div className="relative w-56 h-80 rounded-3xl overflow-hidden border-2 border-brand-gold/40 shadow-[0_0_40px_rgba(200,149,42,0.2)] z-10 shrink-0">
                <Image
                  src={PRODUCT_IMAGES['5w40']}
                  alt="Super M7 5W40"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-black text-center">5W40</p>
                </div>
              </div>

              <div className="relative w-52 h-72 rounded-3xl overflow-hidden border border-brand-gold/20 shadow-2xl rotate-[4deg] translate-y-6 shrink-0">
                <Image
                  src={PRODUCT_IMAGES['5w20']}
                  alt="Super M7 5W20"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-black text-center">5W20</p>
                </div>
              </div>
            </div>

            {/* Logo badge */}
            <div className="bg-zinc-900/80 backdrop-blur border border-brand-gold/20 rounded-2xl px-6 py-3 flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
              </div>
              <div>
                <p className="text-brand-gold text-sm font-black">SUPER M7</p>
                <p className="text-zinc-400 text-xs">Master Oil Canada · Guinée</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-black to-transparent" />
    </section>
  )
}

export default Hero
