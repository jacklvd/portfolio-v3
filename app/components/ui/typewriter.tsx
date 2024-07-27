'use client'

import Typewriter from 'typewriter-effect'

export const Writer: React.FC = () => {
  return (
    <div className="md:text-5xl text-2xl sm:text-md text-gray-900">
      <Typewriter
        options={{
          loop: true,
        }}
        onInit={(typewriter) => {
          typewriter
            .typeString('a Curious Scholar')
            .pauseFor(1000)
            .deleteAll()
            .typeString('a Technology Lover')
            .pauseFor(1000)
            .deleteAll()
            .typeString('a Problem Solver')
            .pauseFor(1000)
            .deleteAll()
            .typeString('a Bun Bo Hue Lover')
            .pauseFor(1000)
            .deleteAll()
            .typeString('a Traveler')
            .pauseFor(1000)
            .deleteAll()
            .start()
        }}
      />
    </div>
  )
}
