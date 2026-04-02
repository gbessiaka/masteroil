import Hero from '@/components/home/Hero'
import ProblemSolution from '@/components/home/ProblemSolution'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import WhyMasterOil from '@/components/home/WhyMasterOil'
import HowToOrder from '@/components/home/HowToOrder'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <FeaturedProducts />
      <WhyMasterOil />
      <HowToOrder />
      <ContactSection />
    </>
  )
}
