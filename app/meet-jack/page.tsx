import { About } from '../components/about'
import ExperienceSection from '../components/experience'

export default function Portfolio() {
  return (
    <div className="flex flex-col items-center justify-between p-12 sm:p-20 md:p-24">
      <About />
      <ExperienceSection />
    </div>
  )
}
