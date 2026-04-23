'use client';
import React, { useState, useEffect } from 'react';
import { client } from '@/client/client';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Experience {
  _id: string;
  position: string;
  company: string;
  date: string;
  url: string;
  description: string[];
}

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const fetchExperiences = async () => {
      const query = `*[_type == "experience"] | order(date desc) {
        _id, position, company, date, url, description
      }`;
      try {
        const data = await client.fetch(query);
        setExperiences(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      } catch (error) {
        console.error('Failed to fetch experiences:', error);
      }
    };
    fetchExperiences();
  }, []);

  const selected = experiences.find(e => e._id === selectedId) || experiences[0];

  if (experiences.length === 0)
    return (
      <div className="py-16 md:py-24 flex justify-center items-center min-h-[200px]">
        <div className="w-5 h-5 border-t border-foreground rounded-full animate-spin" />
      </div>
    );

  return (
    <section className="py-16 md:py-24" id="experience">
      <motion.p {...inView(0)} className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-3">
        02 — Experience
      </motion.p>
      <motion.h2 {...inView(0.05)} className="font-serif text-4xl md:text-5xl text-foreground mb-12 md:mb-16">
        Where I&apos;ve worked.
      </motion.h2>

      <motion.div {...inView(0.1)} className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Company selector */}
        <div className={`w-full md:w-64 md:flex-none ${isMobile ? 'mb-2' : 'pr-10'}`}>
          {isMobile ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-foreground/20 text-sm text-foreground hover:border-foreground/50 transition-colors"
              >
                <span>{selected?.company}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-10 border border-foreground/20 border-t-0 bg-background">
                  {experiences.map(exp => (
                    <button
                      key={exp._id}
                      onClick={() => { setSelectedId(exp._id); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedId === exp._id
                          ? 'text-foreground bg-foreground/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                        }`}
                    >
                      {exp.company}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border-r border-foreground/10 space-y-1">
              {experiences.map(exp => (
                <button
                  key={exp._id}
                  onClick={() => setSelectedId(exp._id)}
                  className={`w-full text-left px-4 py-2.5 text-sm border-l-2 transition-all duration-150 ${selectedId === exp._id
                      ? 'border-foreground text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    }`}
                >
                  {exp.company}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details panel */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex-1 md:pl-14"
            >
              <div className="mb-6">
                <h3 className="text-xl font-medium text-foreground mb-1">{selected.position}</h3>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selected.company}
                  <ExternalLink size={11} />
                </a>
                <p className="text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground/60 mt-2">
                  {selected.date}
                </p>
              </div>

              <ul className="space-y-3">
                {selected.description.map((item, i) => (
                  <motion.li
                    key={`${selected._id}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className="flex items-start gap-3 text-sm text-foreground/70 leading-relaxed"
                  >
                    <span className="mt-[0.4rem] w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
