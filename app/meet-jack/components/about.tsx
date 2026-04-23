/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

export function About() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-16 md:py-24" id="about">
      <motion.p {...fadeUp(0)} className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-3">
        01 — About
      </motion.p>
      <motion.h2 {...fadeUp(0.05)} className="font-serif text-4xl md:text-5xl text-foreground mb-12 md:mb-16">
        Hi, I'm Jack.
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-20">
        {/* Photo + Spotify */}
        <motion.div {...inView(0.1)} className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative aspect-[3/4] overflow-hidden shadow-[12px_12px_0_#e0e0e0] dark:shadow-[12px_12px_0_rgba(255,255,255,0.07)]">
            <Image
              src="/images/hero.jpeg"
              alt="Jack Vo"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div>
            <p className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-2">
              Currently listening
            </p>
            <div className="overflow-hidden rounded-xl">
              <iframe
                src="https://open.spotify.com/embed/track/7a86XRg84qjasly9f6bPSD?utm_source=generator&theme=0"
                width="100%"
                height="80"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-none block"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div {...inView(0.15)} className="lg:col-span-3 flex flex-col">
          <div className="space-y-5 text-foreground/75 leading-relaxed text-[0.95rem]">
            <p>
              I'm Long, but go by Jack — a computer science student pursuing a B.S. and incoming M.S. in CS.
              I care most about solving real-world problems, advocating for sustainability, and building
              community-driven applications.
            </p>
            <p>
              At STEAM for Vietnam, I helped deliver computer science education to Vietnamese children.
              It taught me to stay open-minded — adapting to new environments, languages, and perspectives
              with equal curiosity.
            </p>

            {expanded && (
              <>
                <p>
                  I thrive in environments that celebrate variety and culture. Working alongside people
                  from all walks of life — understanding their needs and finding common ground — is
                  something I genuinely enjoy.
                </p>
                <p>
                  Outside of work: I keep my space compulsively clean, spent way too long reading Greek
                  history, and have recently discovered that cooking for friends is an excellent
                  stress reliever.
                </p>
              </>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
              {expanded ? 'Less' : 'More'}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-foreground/10">
            <Link
              href="https://drive.google.com/file/d/1CdnQUi06RV0N5SsTCVBkHaKUuiUTG6BG/view?usp=sharing"
              className="inline-flex items-center gap-2.5 px-5 py-3 text-xs font-medium
                border border-foreground
                shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5]
                hover:translate-x-[3px] hover:translate-y-[3px]
                hover:shadow-[1px_1px_#121212] dark:hover:shadow-[1px_1px_#e5e5e5]
                transition-all duration-100 tracking-[0.2em] uppercase"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="h-3.5 w-3.5" />
              Download CV
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
