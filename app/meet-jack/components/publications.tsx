'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Book, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Publication {
  title: string
  authors: string
  year: string
  url: string
  abstract?: string
}

export const PublicationsSection = () => {
  const publications: Publication[] = [
    {
      title: 'Real-time Speech Summarization for Medical Conversations',
      authors: 'Co-author by Jack Vo',
      year: '2024',
      url: 'https://arxiv.org/abs/2406.15888',
      abstract:
        'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. In this work, we propose the first deployable real-time speech summarization system for real-world applications in industry, which generates a local summary after every N speech utterances within a conversation and a global summary after the end of a conversation.',
    },
    {
      title: 'Medical Spoken Named Entity Recognition',
      authors: 'Co-author by Jack Vo',
      year: '2024',
      url: 'https://arxiv.org/abs/2406.13337',
      abstract:
        'Spoken Named Entity Recognition (NER) aims to extracting named entities from speech and categorizing them into types like person, location, organization, etc. In this work, we present VietMed-NER - the first spoken NER dataset in the medical domain.',
    },
    {
      title: 'Sentiment Reasoning for Healthcare',
      authors: 'Co-author by Jack Vo',
      year: '2024',
      url: 'https://arxiv.org/abs/2407.21054',
      abstract:
        'Transparency in AI healthcare decision-making is crucial for building trust among AI and users. Incorporating reasoning capabilities enables Large Language Models (LLMs) to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  return (
    <section className="py-16 md:py-24" id="publications">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
          Publications<span className="text-primary">_</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          My research contributions
        </p>

        <motion.div
          className="relative max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Timeline vertical line - better positioned for mobile */}
          <div className="absolute left-6 sm:left-12 md:left-16 top-0 h-full w-0.5 bg-border"></div>

          {publications.map((pub, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative mb-16 pl-14 sm:pl-20 md:pl-28"
            >
              {/* Icon on the timeline */}
              <div className="absolute left-6 sm:left-12 md:left-16 top-6 transform -translate-x-1/2 z-10">
                <div className="rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary text-primary-foreground">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>

              {/* Publication card - now positioned to the right of timeline with better mobile support */}
              <div className="bg-card border border-border rounded-lg shadow-sm w-full">
                <div className="p-4 sm:p-6">
                  {/* Title with badge */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold flex-1">
                      {pub.title}
                    </h3>
                    <Badge className="bg-primary text-primary-foreground shrink-0">
                      {pub.year}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {pub.authors}
                  </p>

                  <p className="text-muted-foreground text-sm my-3 sm:my-4">
                    {pub.abstract}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="magnetic text-xs sm:text-sm"
                  >
                    <Link
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>View Paper</span>
                      <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Button variant="ghost" size="sm" asChild className="magnetic">
            <Link
              href="https://scholar.google.com/citations?user=Ls-8CAoAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Book className="h-4 w-4" />
              <span>View Google Scholar Profile</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
