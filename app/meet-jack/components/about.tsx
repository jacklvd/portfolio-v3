/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import '@/components/styles/about.css'

interface ReadMoreProps {
  children: any
}
const ReadMore: React.FC<ReadMoreProps> = ({ children }) => {
  const text = children
  const [isReadMore, setIsReadMore] = useState(true)
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }
  return (
    <p className="about_description">
      {isReadMore ? text.slice(0, 2) : text}
      <span onClick={toggleReadMore} className="read-or-hide">
        {isReadMore ? ' READ MORE...' : ' ...READ LESS'}
      </span>
    </p>
  )
}

export function About() {
  return (
    <section className="about section">
      <h2 className="text-3xl font-bold tracking-tight mb-2 text-center">
        About Me<span className="text-primary">_</span>
      </h2>
      <p className="text-muted-foreground text-center mb-12">
        Let get to know me better
      </p>

      <div className="about_container container grid">
        <Image
          src="/images/hero.jpeg"
          width={300}
          height={300}
          alt="Jack Vo"
          className="about_img"
          loading="lazy"
        />
        <div className="about_data">
          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 1, delayChildren: 0.8 }}
            className="about_data"
          >
            {/* Spotify embed */}
            <div className="mb-6 rounded-md overflow-hidden border">
              <iframe
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/track/0s7RyyUlQfd8mnnboHe18n?utm_source=generator&theme=0"
                width="100%"
                height="152"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </div>

            <ReadMore>
              <span role="img">👋🏻</span> Hi, I'm Long, but also go by Jack. I'm
              a senior at the University of Cincinnati. I'm pursuing a BS degree
              in Computer Science with an anticipated graduation in May 2025.
              I'm most passionate about solving real world problems, advocating
              sustainability, and building community-driven applications.
              <br />
              <br />
              <span role="img">✨</span> I appreciate every challenge I came
              across that helped cultivate my self-efficacy in this risk-taking
              world. At STEAM for Vietnam, I have a chance to work with many
              great and talented people to delivery high-end computer science
              course to Vietnamese children. I learned the importance of staying
              open-minded to changes, whether to be adapted to new environment,
              programming languages, or attitudes. I feel motivated as I
              discover ways to improve flexibility and creative through ongoing
              discussions with others to address a customer's changing needs.
              <br />
              <br />
              <span role="img">⛱️</span> I love cleaning and organize my
              workplace. I feel like if I can keep my work area clean, I can
              successfully do other things as well. I love reading and
              listening. I used to spend hours to read the History of Greek
              ~quite interesting indeed~. Coming to American, I found out that I
              actually enjoy cooking for my friends as it can help me to relieve
              stress from working and studying.
              <br />
              <br />
              <span role="img">🗽</span> What motivates me to get up and get
              ready for work is the knowledge that I have another opportunity to
              deliver love and camaraderie to my neighborhood. I thrive in
              occupations that promote variety and culture, and I appreciate
              working with people from all walks of life to achieve a common
              goal. Not only do I regard it as an opportunity to gain new
              knowledge, but also to connect profoundly with individuals through
              their diverse perspectives on situations. I strive to be a team
              player, to be aware of those around me's needs and desires, and to
              thrive on positive reinforcement.
            </ReadMore>

            <Link
              href="https://drive.google.com/file/d/1hisMx0QbsGK17oNojf60JSS04x_9IH3U/view?usp=sharing"
              className="inline-flex items-center px-4 py-3 text-sm font-medium border border-gray-900 dark:border-gray-100 
      rounded-lg shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5] transition-all duration-100 
      text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900
      hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_#121212] dark:hover:shadow-[2px_2px_#e5e5e5] tracking-widest"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="mr-2 h-4 w-4" />
              DOWNLOAD CV
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
