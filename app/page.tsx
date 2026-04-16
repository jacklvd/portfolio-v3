'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { data } from '@/constants';
import { Writer } from '@/components/typewriter';

const Scene = dynamic(() => import('@/components/scene'), { ssr: false });

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

export default function Home() {
  const socials = Object.entries(data.social);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* 3D background — pointer-events-none so text stays interactive */}
      <div className="absolute inset-0 pointer-events-none">
        <Scene />
      </div>

      {/* Hero text */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-28">
        <div className="flex flex-col items-center text-center gap-5">
          <motion.p
            {...fadeUp(0)}
            className="text-[0.6rem] tracking-[0.45em] uppercase text-muted-foreground font-light"
          >
            Xin Chào, I&apos;m
          </motion.p>

          <motion.h1
            {...fadeUp(0.18)}
            className="font-serif text-[clamp(3.5rem,13vw,9.5rem)] leading-[0.9] tracking-tight text-foreground"
          >
            Jack Vo
          </motion.h1>

          <motion.div {...fadeUp(0.36)}>
            <Writer />
          </motion.div>

          <motion.div
            {...fadeUp(0.54)}
            className="flex items-center gap-7 mt-3"
          >
            {socials.map(([name, social]) => {
              const isEmail = social.url.startsWith('mailto:');
              return (
                <Link
                  key={name}
                  href={social.url}
                  {...(!isEmail && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  aria-label={name}
                >
                  <social.icon className="size-[18px]" />
                </Link>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
