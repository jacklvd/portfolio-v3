'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Publication {
  title: string;
  authors: string;
  year: string;
  url: string;
  abstract?: string;
}

const publications: Publication[] = [
  {
    title: 'Real-time Speech Summarization for Medical Conversations',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.15888',
    abstract:
      'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. We propose the first deployable real-time speech summarization system for real-world applications in industry, generating a local summary after every N speech utterances and a global summary at the end of a conversation.',
  },
  {
    title: 'Medical Spoken Named Entity Recognition',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2406.13337',
    abstract:
      'Spoken Named Entity Recognition (NER) aims to extract named entities from speech and categorize them into types like person, location, organization, etc. We present VietMed-NER — the first spoken NER dataset in the medical domain.',
  },
  {
    title: 'Sentiment Reasoning for Healthcare',
    authors: 'Co-author — Jack Vo',
    year: '2024',
    url: 'https://arxiv.org/abs/2407.21054',
    abstract:
      'Transparency in AI healthcare decision-making is crucial for building trust. Incorporating reasoning capabilities enables Large Language Models to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
  },
];

export const PublicationsSection = () => {
  return (
    <section className="py-16 md:py-24" id="publications">
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-3"
      >
        04 — Research
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
        className="font-serif text-4xl md:text-5xl text-foreground mb-12 md:mb-16"
      >
        Publications.
      </motion.h2>

      <div className="space-y-0">
        {publications.map((pub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.08 }}
            className="group border-t border-foreground/10 py-8 last:border-b"
          >
            <div className="grid grid-cols-1 md:grid-cols-[3rem_1fr_auto] gap-4 md:gap-8 items-start">
              {/* Index */}
              <span className="text-[0.65rem] tracking-[0.3em] text-muted-foreground/50 pt-1 hidden md:block">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <h3 className="font-serif text-lg md:text-xl text-foreground leading-snug group-hover:text-foreground/80 transition-colors">
                    {pub.title}
                  </h3>
                  <span className="shrink-0 text-[0.6rem] tracking-[0.2em] uppercase border border-foreground/20 px-2 py-0.5 text-muted-foreground mt-1">
                    {pub.year}
                  </span>
                </div>
                <p className="text-xs tracking-wide text-muted-foreground/70">{pub.authors}</p>
                <p className="text-sm text-foreground/60 leading-relaxed max-w-2xl">{pub.abstract}</p>
              </div>

              {/* Link */}
              <div className="flex md:justify-end pt-1">
                <Link
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  Read paper
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scholar CTA */}
      <div className="mt-12 pt-8 border-t border-foreground/10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Full publication history</p>
        <Link
          href="https://scholar.google.com/citations?user=Ls-8CAoAAAAJ&hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3 text-xs font-medium
            border border-foreground
            shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5]
            hover:translate-x-[3px] hover:translate-y-[3px]
            hover:shadow-[1px_1px_#121212] dark:hover:shadow-[1px_1px_#e5e5e5]
            transition-all duration-100 tracking-[0.2em] uppercase"
        >
          <BookOpen size={13} />
          Google Scholar
        </Link>
      </div>
    </section>
  );
};
