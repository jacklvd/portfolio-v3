'use client'
import React, { useState, useEffect } from 'react'
import { client } from '@/client/client'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface Experience {
  _id: string
  position: string
  company: string
  date: string
  url: string
  description: string[]
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.2, // Each item will appear one after the other
    },
  }),
}

const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    const fetchExperiences = async () => {
      const query = `*[_type == "experience"] | order(date desc) {
                _id,
                position,
                company,
                date,
                url,
                description
            }`
      try {
        const fetchedExperiences = await client.fetch(query)
        setExperiences(fetchedExperiences)
        if (fetchedExperiences.length > 0) {
          setSelectedId(fetchedExperiences[0]._id)
        }
      } catch (error) {
        console.error('Failed to fetch experiences:', error)
      }
    }
    fetchExperiences()
  }, [])

  const selectedExperience =
    experiences.find((exp) => exp._id === selectedId) || experiences[0]

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen)
  }

  const selectCompany = (id: string) => {
    setSelectedId(id)
    setDropdownOpen(false)
  }

  if (experiences.length === 0)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    )

  return (
    <section className="py-16 md:py-24" id="experience">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
          Experience<span className="text-primary">_</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Each journey taught me to better
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Company list */}
            <div
              className={`w-full md:w-64 md:flex-none ${isMobile ? 'mb-4' : 'pr-6'}`}
            >
              {isMobile ? (
                <div className="md:hidden w-full mb-4">
                  <div
                    className="bg-primary/10 text-foreground p-3 rounded-md flex justify-between items-center cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <span className="font-medium">
                      {selectedExperience.company}
                    </span>
                    <ChevronDown
                      className={`transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                    />
                  </div>
                  {isDropdownOpen && (
                    <div className="mt-2 bg-background border rounded-md overflow-hidden shadow-md">
                      {experiences.map((exp) => (
                        <div
                          key={exp._id}
                          className={`p-3 cursor-pointer hover:bg-primary/5 transition-colors ${
                            selectedId === exp._id
                              ? 'text-primary border-l-2 border-primary pl-[10px]'
                              : ''
                          }`}
                          onClick={() => selectCompany(exp._id)}
                        >
                          {exp.company}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 border-r border-muted">
                  {experiences.map((exp) => (
                    <div
                      key={exp._id}
                      className={`px-4 py-2 text-sm cursor-pointer hover:text-primary transition-colors duration-200 ${
                        selectedId === exp._id
                          ? 'text-primary border-l-2 border-primary font-medium'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setSelectedId(exp._id)}
                    >
                      {exp.company}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience details */}
            <div className="flex-grow md:pl-6">
              <div>
                <span className="text-xl font-semibold">
                  {selectedExperience.position}
                </span>{' '}
                <a
                  href={selectedExperience.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @ {selectedExperience.company}
                </a>
              </div>
              <p className="text-sm text-muted-foreground my-2">
                {selectedExperience.date}
              </p>

              <ul className="space-y-2 mt-4">
                {selectedExperience.description.map((des, index) => (
                  <motion.li
                    key={`${selectedExperience._id}-${index}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">▹</span>
                    <span>{des}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection
