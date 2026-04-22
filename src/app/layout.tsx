import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.masteroilguinee.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Master Oil Guinée | Huile Moteur Synthétique Super M7',
    template: '%s | Master Oil Guinée',
  },
  description:
    "Distributeur exclusif en Guinée de l'huile moteur synthétique canadienne Super M7. Qualité certifiée, disponible à Conakry. Commandez rapidement.",
  keywords: [
    'huile moteur guinée',
    'super m7',
    'huile synthétique conakry',
    'master oil guinée',
    'lubrifiant guinée',
    'distributeur huile moteur conakry',
    'huile moteur 5w30 guinée',
    'huile moteur 5w40 guinée',
  ],
  authors: [{ name: 'Master Oil Guinée' }],
  creator: 'Master Oil Guinée',
  openGraph: {
    type: 'website',
    locale: 'fr_GN',
    url: BASE_URL,
    siteName: 'Master Oil Guinée',
    title: 'Master Oil Guinée | Huile Moteur Synthétique Super M7',
    description:
      "Distributeur exclusif en Guinée de l'huile moteur synthétique canadienne Super M7. Qualité certifiée, disponible à Conakry.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Master Oil Guinée | Huile Moteur Synthétique Super M7',
    description:
      "Distributeur exclusif en Guinée de l'huile moteur synthétique canadienne Super M7.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#C8952A" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
