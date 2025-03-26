'use client'
import { useState, useEffect } from 'react'
import { client, urlFor } from '../../../client/client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'

interface Work {
  _id: string
  title: string
  description: string
  technologies: string[]
  source: string
  liveUrl?: string
  image: any
}

const Project = () => {
  const [works, setWorks] = useState<Work[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    client
      .fetch('*[_type == "work"] | order(orderRank)')
      .then((data) => {
        setWorks(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch projects:', error)
        setIsLoading(false)
      })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  // Function to truncate text to a specific length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <section className="py-16 md:py-24 section" id="work">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
          My Projects<span className="text-primary">_</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Some of my projects ..
        </p>

        {isLoading ? (
          <div className="grid place-items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {works.map((work) => (
              <motion.div
                key={work._id}
                variants={itemVariants}
                className="h-full"
              >
                <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={urlFor(work.image).width(600).url()}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-grow line-clamp-3">
                      {truncateText(work.description, 120)}
                    </p>
                    {work.technologies && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {work.technologies.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {work.technologies.length > 3 && (
                          <Badge variant="outline" className="font-normal">
                            +{work.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-6 py-4 flex gap-3 border-t mt-auto">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={work.source}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Github size={16} />
                        <span>Source</span>
                      </a>
                    </Button>
                    {work.liveUrl && (
                      <Button size="sm" asChild>
                        <a
                          href={work.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          <span>Live Demo</span>
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-10">
          <Button variant="ghost" asChild>
            <a
              href="https://github.com/jacklvd"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <Github size={18} />
              <span>More projects on GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Project
