import Hero from './components/Hero'
import Problem from './components/Problem'
import VideoShowcase from './components/VideoShowcase'
import CurriculumAlignment from './components/CurriculumAlignment'
import PilotDetails from './components/PilotDetails'
import ApplicationForm from './components/ApplicationForm'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function PromoPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <VideoShowcase />
      <CurriculumAlignment />
      <PilotDetails />
      <ApplicationForm />
      <FAQ />
      <Footer />
    </main>
  )
}
