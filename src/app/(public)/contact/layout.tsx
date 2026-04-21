import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez Master Oil Guinée pour un devis, des renseignements sur nos huiles moteur Super M7 ou un partenariat. Réponse rapide par email ou WhatsApp.",
  keywords: [
    'contact master oil guinée',
    'devis huile moteur conakry',
    'commander huile moteur guinée',
    'partenariat lubrifiant guinée',
    'whatsapp master oil',
  ],
  openGraph: {
    title: 'Contact — Master Oil Guinée',
    description:
      "Contactez-nous pour un devis ou un renseignement sur nos huiles moteur Super M7 à Conakry.",
    url: 'https://www.masteroilguinee.com/contact',
  },
  alternates: {
    canonical: 'https://www.masteroilguinee.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
