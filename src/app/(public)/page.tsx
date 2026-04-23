import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ProblemSolution from '@/components/home/ProblemSolution'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import WhyMasterOil from '@/components/home/WhyMasterOil'
import HowToOrder from '@/components/home/HowToOrder'
import ContactSection from '@/components/home/ContactSection'
import MapSection from '@/components/home/MapSection'

export const metadata: Metadata = {
  title: 'Master Oil Guinée | Huile Moteur Synthétique Super M7 — Conakry',
  description:
    "Achetez l'huile moteur synthétique Super M7 en Guinée. Distributeur exclusif à Conakry : 5W-30, 5W-40, 0W-20. Lubrifiant moteur canadien certifié, livraison rapide.",
  keywords: [
    'huile moteur guinée',
    'lubrifiant moteur conakry',
    'super m7 guinée',
    'huile synthétique guinée',
    'huile moteur conakry',
    'lubrifiant moteur guinée',
    'distributeur huile moteur guinée',
    'super m7 5w30 5w40',
    'master oil guinée',
  ],
  alternates: {
    canonical: 'https://www.masteroilguinee.com',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <FeaturedProducts />
      <WhyMasterOil />
      <HowToOrder />
      <ContactSection />
      <MapSection />
    </>
  )
}
