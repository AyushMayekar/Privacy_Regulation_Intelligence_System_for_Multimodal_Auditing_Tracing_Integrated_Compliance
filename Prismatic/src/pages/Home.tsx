import '../styles/theme.css'
import '../styles/home.css'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import ScrollSection from '../components/landing/ScrollSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import DashboardPreview from '../components/landing/DashboardPreview'
import DevelopersSection from '../components/landing/DevelopersSection'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'

export default function Home() {
  return (
    <div className="home-root">
      <Navbar />
      <Hero />
      <ScrollSection />
      <FeaturesSection />
      <DashboardPreview />
      <DevelopersSection />
      <CTASection />
      <Footer />
    </div>
  )
}
