import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Master Oil Guinée | Huile Moteur Synthétique Canadienne Super M7',
  description:
    "Distributeur exclusif en Guinée de l'huile moteur synthétique canadienne Super M7. Qualité certifiée, disponible à Conakry. Commandez sur WhatsApp.",
  keywords:
    'huile moteur guinée, super m7, huile synthétique conakry, master oil guinée, lubrifiant guinée',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
