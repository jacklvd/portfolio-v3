'use client'
import { useState, useEffect } from 'react'
import { About } from './components/about'
import ExperienceSection from './components/experience'
import Footer from '../../components/footer'
import Project from './components/projects'
import { PublicationsSection } from './components/publications'
// import { ContactSection } from './components/contact'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

export default function Portfolio() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Check scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <About />
          <ExperienceSection />
          <Project />
          <PublicationsSection />
          {/* <ContactSection /> */}
        </div>
      </main>

      <Footer />

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          variant="ghost"
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full opacity-90 shadow-md z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </Button>
      )}
    </div>
  )
}
