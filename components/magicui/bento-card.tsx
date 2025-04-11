import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Github, ExternalLink } from 'lucide-react'
import { urlFor } from '@/client/client'

const BentoCard = ({
  work,
  size,
}: {
  work: Work
  size: 'small' | 'medium' | 'large'
}) => {
  const truncateDescription = (text: string) => {
    const maxLength = size === 'large' ? 150 : size === 'medium' ? 100 : 70
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div
      className={`group relative h-full rounded-xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-300`}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={urlFor(work.image).width(800).url()}
          alt={work.title}
          className="w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full p-6">
        <div>
          <h3
            className={`font-bold text-xl mb-2 group-hover:text-primary transition-colors`}
          >
            {work.title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {truncateDescription(work.description)}
          </p>
        </div>

        <div className="mt-auto">
          {work.technologies && (
            <div className="flex flex-wrap gap-2 mb-4">
              {work.technologies
                .slice(0, size === 'small' ? 2 : 3)
                .map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              {work.technologies.length > (size === 'small' ? 2 : 3) && (
                <Badge variant="outline" className="font-normal">
                  +{work.technologies.length - (size === 'small' ? 2 : 3)}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href={work.source}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <Github size={16} />
                <span className={size === 'small' ? 'sr-only' : ''}>
                  Source
                </span>
              </a>
            </Button>
            {work.demo && (
              <Button size="sm" asChild>
                <a
                  href={work.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  <span className={size === 'small' ? 'sr-only' : ''}>
                    Live Demo
                  </span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BentoCard
