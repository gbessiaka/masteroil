'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, MessageCircle } from 'lucide-react'
import { cn, getWhatsAppLink } from '@/lib/utils'
import { LOGO_URL } from '@/lib/mockData'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'À Propos' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const whatsappLink = getWhatsAppLink()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-brand-black/95 backdrop-blur-md shadow-dark py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={LOGO_URL}
              alt="Master Oil"
              width={44}
              height={44}
              className="object-contain"
            />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-brand-gold tracking-tight group-hover:text-brand-gold-light transition-colors">
                MASTER OIL
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                GUINÉE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-brand-gold transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* WhatsApp CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm',
                'bg-brand-gold text-white hover:bg-brand-gold-dark transition-all duration-200',
                'shadow-gold hover:shadow-gold-lg'
              )}
            >
              <MessageCircle size={16} />
              Commander
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 top-0 z-50 transition-all duration-300',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-72 bg-brand-black border-l border-white/10',
            'transition-transform duration-300 flex flex-col',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <span className="text-lg font-bold text-brand-gold">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-6 pb-8">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-brand-gold text-white hover:bg-brand-gold-dark transition-colors shadow-gold"
            >
              <MessageCircle size={18} />
              Commander sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
