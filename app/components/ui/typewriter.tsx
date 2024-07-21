'use client'

import Typewriter from 'typewriter-effect'

export const Writer: React.FC = () => {
    return (
        <div className='lg:text-5xl md:text-3xl sm:text-md text-gray-900'>
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
                        .start()
                }}
            />
        </div>
    )
}