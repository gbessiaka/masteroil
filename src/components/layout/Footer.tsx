import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'
import { LOGO_URL } from '@/lib/mockData'

const quickLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Nos Produits' },
  { href: '/services', label: 'Services B2B' },
  { href: '/about', label: 'À Propos' },
  { href: '/contact', label: 'Contact' },
]

const productLinks = [
  { href: '/produits/1', label: 'Super M7 5W-30' },
  { href: '/produits/2', label: 'Super M7 5W-40' },
  { href: '/produits/3', label: 'Super M7 5W-20' },
  { href: '/produits/4', label: 'Super M7 0W-20' },
]

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '224620000000'
  const whatsappLink = getWhatsAppLink('Bonjour Master Oil Guinée, je voudrais avoir des informations.')

  return (
    <footer className="bg-brand-black border-t border-white/10">
      {/* Distributor badge */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-brand-gold/30 max-w-32" />
            <span className="text-brand-gold text-sm font-semibold tracking-wide uppercase">
              Distributeur exclusif de Master Oil Canada en Guinée
            </span>
            <div className="h-px flex-1 bg-brand-gold/30 max-w-32" />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Image src={LOGO_URL} alt="Master Oil" width={40} height={40} className="object-contain" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-brand-gold">MASTER OIL</span>
                <span className="text-lg font-black text-white">GUINÉE</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Votre partenaire de confiance pour les huiles moteur synthétiques canadiennes en Guinée. Qualité certifiée, service professionnel.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Liens rapides
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-gold text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-3 h-0.5 bg-brand-gold/40 group-hover:bg-brand-gold group-hover:w-4 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Produits
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-gold text-sm transition-colors flex items-start gap-1.5 group"
                  >
                    <span className="w-3 h-0.5 bg-brand-gold/40 group-hover:bg-brand-gold group-hover:w-4 transition-all duration-200 mt-2.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-brand-gold transition-colors group"
                >
                  <MessageCircle size={16} className="mt-0.5 text-brand-gold shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                    <p className="text-sm">+{whatsappNumber}</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <Phone size={16} className="mt-0.5 text-brand-gold shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                    <p className="text-sm">+{whatsappNumber}</p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin size={16} className="mt-0.5 text-brand-gold shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Adresse</p>
                    <p className="text-sm">Conakry, Guinée</p>
                    <p className="text-sm">République de Guinée</p>
                  </div>
                </div>
              </li>
              <li>
                <a
                  href="mailto:contact@masteroilguinee.com"
                  className="flex items-start gap-3 text-gray-400 hover:text-brand-gold transition-colors"
                >
                  <Mail size={16} className="mt-0.5 text-brand-gold shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm">contact@masteroilguinee.com</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-sm">
              © 2026 Master Oil Guinée. Tous droits réservés.
            </p>
            <p className="text-gray-600 text-xs">
              Distributeur exclusif de Master Oil Canada en Guinée en Guinée
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
