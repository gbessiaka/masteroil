import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ProblemSolution from '@/components/home/ProblemSolution'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import WhyMasterOil from '@/components/home/WhyMasterOil'
import HowToOrder from '@/components/home/HowToOrder'
import ContactSection from '@/components/home/ContactSection'
import MapSection from '@/components/home/MapSection'

export const metadata: Metadata = {
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
