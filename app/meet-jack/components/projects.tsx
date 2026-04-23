'use client';
import { useState, useEffect } from 'react';
import { client, urlFor } from '@/client/client';
import { motion } from 'framer-motion';
import { GitBranch, ExternalLink } from 'lucide-react';
import BentoCard from '@/components/magicui/bento-card';
import Image from 'next/image';

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Project = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    client
      .fetch('*[_type == "work"] | order(orderRank)')
      .then(data => {
        const modifiedData = data.map((work: Work, index: number) => ({
          ...work,
          featured: index < 4,
        }));
        setWorks(modifiedData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch projects:', error);
        setIsLoading(false);
      });
  }, []);

  const featuredWorks = works.filter(w => w.featured);
  const regularWorks = works.filter(w => !w.featured);

  return (
    <section className="py-16 md:py-24" id="work">
      <motion.p {...inView(0)} className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground mb-3">
        03 — Projects
      </motion.p>
      <motion.h2 {...inView(0.05)} className="font-serif text-4xl md:text-5xl text-foreground mb-12 md:mb-16">
        Things I&apos;ve built.
      </motion.h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-5 h-5 border-t border-foreground rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-16">
          {/* Bento grid — featured projects */}
          {featuredWorks.length > 0 && (
            <div>
              <motion.p {...inView(0.1)} className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Featured
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                <motion.div className="lg:col-span-2 lg:row-span-2" variants={itemVariants}>
                  <BentoCard work={featuredWorks[0]} size="large" />
                </motion.div>
                {featuredWorks[1] && (
                  <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <BentoCard work={featuredWorks[1]} size="medium" />
                  </motion.div>
                )}
                {featuredWorks[2] && (
                  <motion.div variants={itemVariants}>
                    <BentoCard work={featuredWorks[2]} size="small" />
                  </motion.div>
                )}
                {featuredWorks[3] && (
                  <motion.div variants={itemVariants}>
                    <BentoCard work={featuredWorks[3]} size="small" />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Regular grid */}
          {regularWorks.length > 0 && (
            <div>
              <motion.p {...inView(0.1)} className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-6">
                More work
              </motion.p>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {regularWorks.map(work => (
                  <motion.div key={work._id} variants={itemVariants} className="h-full">
                    <div className="border border-foreground/10 h-full flex flex-col group hover:border-foreground/30 transition-colors duration-300 overflow-hidden">
                      {/* Image */}
                      <div className="aspect-video overflow-hidden">
                        <Image
                          src={urlFor(work.image).url()}
                          alt={work.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-medium text-foreground mb-2 leading-snug">
                          {work.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                          {work.description.length > 120
                            ? work.description.slice(0, 120) + '…'
                            : work.description}
                        </p>

                        {work.technologies && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {work.technologies.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border border-foreground/15 text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {work.technologies.length > 3 && (
                              <span className="px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border border-foreground/15 text-muted-foreground">
                                +{work.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-foreground/10">
                          <a
                            href={work.source}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <GitBranch size={13} />
                            Source
                          </a>
                          {work.demo && (
                            <a
                              href={work.demo}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink size={13} />
                              Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* GitHub CTA */}
          <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">More on GitHub</p>
            <a
              href="https://github.com/jacklvd"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 text-xs font-medium
                border border-foreground
                shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5]
                hover:translate-x-[3px] hover:translate-y-[3px]
                hover:shadow-[1px_1px_#121212] dark:hover:shadow-[1px_1px_#e5e5e5]
                transition-all duration-100 tracking-[0.2em] uppercase"
            >
              <GitBranch size={13} />
              View all
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default Project;
