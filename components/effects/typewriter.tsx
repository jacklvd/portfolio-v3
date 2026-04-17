'use client'

import Typewriter from 'typewriter-effect'

export const Writer: React.FC = () => {
  return (
    <div className="text-[0.6rem] tracking-[0.4em] uppercase text-muted-foreground [&_.Typewriter\_\_cursor]:text-muted-foreground [&_.Typewriter\_\_cursor]:font-light">
      <Typewriter
        options={{
          loop: true,
          cursor: '_',
          delay: 55,
          deleteSpeed: 25,
        }}
        onInit={(typewriter) => {
          typewriter
            .typeString('a Curious Scholar')
            .pauseFor(1800)
            .deleteAll()
            .typeString('a Technology Lover')
            .pauseFor(1800)
            .deleteAll()
            .typeString('a Problem Solver')
            .pauseFor(1800)
            .deleteAll()
            .typeString('a Pho Bo Lover')
            .pauseFor(1800)
            .deleteAll()
            .typeString('a Traveler')
            .pauseFor(1800)
            .deleteAll()
            .start()
        }}
      />
    </div>
  )
}
