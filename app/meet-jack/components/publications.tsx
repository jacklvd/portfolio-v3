'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Book, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Publication {
  title: string
  authors: string
  // journal: string
  year: string
  url: string
  abstract?: string
}

export const PublicationsSection = () => {
  const publications: Publication[] = [
    {
      title: 'Real-time Speech Summarization for Medical Conversations',
      authors: 'Co-author by Jack Vo',
      // journal: "arXiv:2406.15888",
      year: '2024',
      url: 'https://arxiv.org/abs/2406.15888',
      abstract:
        'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. In this work, we propose the first deployable real-time speech summarization system for real-world applications in industry, which generates a local summary after every N speech utterances within a conversation and a global summary after the end of a conversation. Our system could enhance user experience from a business standpoint, while also reducing computational costs from a technical perspective. Secondly, we present VietMed-Sum which, to our knowledge, is the first speech summarization dataset for medical conversations. Thirdly, we are the first to utilize LLM and human annotators collaboratively to create gold standard and synthetic summaries for medical conversation summarization. Finally, we present baseline results of state-of-the-art models on VietMed-Sum.',
    },
    {
      title: 'Medical Spoken Named Entity Recognition',
      authors: 'Co-author by Jack Vo',
      // journal: "arXiv:2406.13337",
      year: '2024',
      url: 'https://arxiv.org/abs/2406.13337',
      abstract:
        'Spoken Named Entity Recognition (NER) aims to extracting named entities from speech and categorizing them into types like person, location, organization, etc. In this work, we present VietMed-NER - the first spoken NER dataset in the medical domain. To our best knowledge, our real-world dataset is the largest spoken NER dataset in the world in terms of the number of entity types, featuring 18 distinct types. Secondly, we present baseline results using various state-of-the-art pre-trained models: encoder-only and sequence-to-sequence. We found that pre-trained multilingual models XLM-R outperformed all monolingual models on both reference text and ASR output. Also in general, encoders perform better than sequence-to-sequence models for the NER task. By simply translating, the transcript is applicable not just to Vietnamese but to other languages as well. ',
    },
    {
      title: 'Sentiment Reasoning for Healthcare',
      authors: 'Co-author by Jack Vo',
      // journal: "arXiv:2407.21054",
      year: '2024',
      url: 'https://arxiv.org/abs/2407.21054',
      abstract:
        'Transparency in AI healthcare decision-making is crucial for building trust among AI and users. Incorporating reasoning capabilities enables Large Language Models (LLMs) to understand emotions in context, handle nuanced language, and infer unstated sentiments. In this work, we introduce a new task -- Sentiment Reasoning -- for both speech and text modalities, along with our proposed multimodal multitask framework and dataset. Sentiment Reasoning is an auxiliary task in sentiment analysis where the model predicts both the sentiment label and generates the rationale behind it based on the input transcript. Our study conducted on both human transcripts and Automatic Speech Recognition (ASR) transcripts shows that Sentiment Reasoning helps improve model transparency by providing rationale for model prediction with quality semantically comparable to humans while also improving model performance (1% increase in both accuracy and macro-F1) via rationale-augmented fine-tuning. Also, no significant difference in the semantic quality of generated rationales between human and ASR transcripts.',
    },
  ]

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
          className="grid grid-cols-1 gap-6 max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {publications.map((pub, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border border-border hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <span>{pub.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {pub.authors}
                    <span className="mx-2">•</span>
                    <span>{pub.year}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 truncate">
                    {pub.abstract}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {/* <span className="font-medium">{pub.journal}</span> */}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Paper</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Button variant="ghost" asChild>
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
