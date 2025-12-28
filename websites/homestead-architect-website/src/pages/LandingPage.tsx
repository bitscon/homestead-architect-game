import Navigation from '@/components/landing/Navigation'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import HowItWorks from '@/components/landing/HowItWorks'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Pricing />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}

export default LandingPage