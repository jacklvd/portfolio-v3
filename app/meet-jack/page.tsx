import { About } from '../components/about'
import ExperienceSection from '../components/experience'
import Footer from '../components/footer'
import Project from '../components/projects'

export default function Portfolio() {
  return (
    <div className="flex flex-col items-center justify-between p-10 sm:p-20 md:p-24">
      <About />
      <ExperienceSection />
      <Project />
      <Footer />
    </div>
  )
}
