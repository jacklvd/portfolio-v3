'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { data } from '@/constants';
import { Writer } from '@/components/typewriter';
import { Sticker } from '@/components/sticker';

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
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* Draggable stickers */}
      <Sticker label="jv.meme" top="14%" left="33%" width={176}>
        <div className="flex flex-col items-center justify-center px-5 py-6 gap-1">
          <span className="font-serif italic text-4xl leading-none tracking-tight text-foreground">
            Jack Vo
          </span>
          <span className="text-[0.5rem] tracking-[0.3em] uppercase text-muted-foreground font-light mt-1">
            est. {new Date().getFullYear()}
          </span>
        </div>
      </Sticker>

      <Sticker label="currently.log" top="58%" left="22%" width={192}>
        <div className="flex flex-col gap-2 px-4 py-4">
          {[
            { dot: 'bg-[#6fa89e]', text: 'Building cool things' },
            { dot: 'bg-[#c4685a]', text: 'Drinking too much coffee' },
            { dot: 'bg-[#a07896]', text: 'Looking for Pho' },
          ].map(({ dot, text }) => (
            <div key={text} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              <span className="text-[0.6rem] tracking-wide text-foreground/70 font-light">{text}</span>
            </div>
          ))}
        </div>
      </Sticker>

      <Sticker label="xin-chao.txt" top="12%" right="23%" width={168}>
        <div className="flex flex-col items-center justify-center px-4 py-5 gap-2">
          <span className="font-serif text-2xl text-foreground tracking-wide">Xin Chào</span>
          <span className="text-[0.5rem] tracking-[0.25em] uppercase text-muted-foreground font-light text-center leading-relaxed">
            Vietnamese · /sɪn tʃaʊ/
          </span>
          <span className="text-[0.55rem] text-muted-foreground/60 italic font-light">&ldquo;hello&rdquo;</span>
        </div>
      </Sticker>

      <Sticker label="stack.json" top="42%" right="19%" width={180}>
        <div className="flex flex-col gap-1.5 px-4 py-4">
          {[
            { label: 'Next.js', color: 'text-foreground' },
            { label: 'TypeScript', color: 'text-[#6fa89e]' },
            { label: 'React', color: 'text-[#a07896]' },
            { label: 'Python', color: 'text-[#c4685a]' },
            { label: 'Tailwind', color: 'text-foreground/50' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-muted-foreground/40 text-[0.5rem]">▸</span>
              <span className={`text-[0.6rem] tracking-wide font-light ${color}`}>{label}</span>
            </div>
          ))}
        </div>
      </Sticker>

      <Sticker label="mood.wav" bottom="14%" right="29%" width={166}>
        <div className="flex flex-col items-center justify-center px-4 py-5 gap-3">
          <span className="text-3xl leading-none">🍜</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] tracking-[0.2em] uppercase text-foreground/70 font-light">
              current mood
            </span>
            <span className="font-serif italic text-sm text-foreground">
              always hungry
            </span>
          </div>
        </div>
      </Sticker>

      {/* Hero text */}
      <main className="relative z-10 pointer-events-none flex min-h-screen flex-col items-center justify-center px-6 pb-28">
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
            className="flex items-center gap-7 mt-3 pointer-events-auto"
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
