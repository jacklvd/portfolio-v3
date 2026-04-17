import { urlFor } from '@/client/client';
import { GitBranch, ExternalLink } from 'lucide-react';

const BentoCard = ({
  work,
  size,
}: {
  work: Work;
  size: 'small' | 'medium' | 'large';
}) => {
  const maxLen = size === 'large' ? 160 : size === 'medium' ? 110 : 75;
  const desc =
    work.description.length > maxLen
      ? work.description.slice(0, maxLen) + '…'
      : work.description;

  const tagLimit = size === 'small' ? 2 : 3;
  const extra = work.technologies
    ? work.technologies.length - tagLimit
    : 0;

  const Links = () => (
    <div className="flex items-center gap-4">
      <a
        href={work.source}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-xs tracking-wide hover:opacity-70 transition-opacity"
      >
        <GitBranch size={12} />
        Source
      </a>
      {work.demo && (
        <a
          href={work.demo}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs tracking-wide hover:opacity-70 transition-opacity"
        >
          <ExternalLink size={12} />
          Demo
        </a>
      )}
    </div>
  );

  const Tags = ({ light = false }: { light?: boolean }) => (
    work.technologies ? (
      <div className="flex flex-wrap gap-1.5">
        {work.technologies.slice(0, tagLimit).map((tag: string) => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border ${
              light
                ? 'border-white/30 text-white/70'
                : 'border-foreground/15 text-muted-foreground'
            }`}
          >
            {tag}
          </span>
        ))}
        {extra > 0 && (
          <span
            className={`px-2 py-0.5 text-[0.6rem] tracking-wider uppercase border ${
              light
                ? 'border-white/30 text-white/70'
                : 'border-foreground/15 text-muted-foreground'
            }`}
          >
            +{extra}
          </span>
        )}
      </div>
    ) : null
  );

  /* ── Large card: full-bleed image + gradient overlay ── */
  if (size === 'large') {
    return (
      <div className="group relative h-full overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-colors duration-300">
        {/* Image */}
        <img
          src={urlFor(work.image).width(900).url()}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-3">
          <h3 className="font-serif text-xl leading-snug">{work.title}</h3>
          <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
          <Tags light />
          <div className="pt-1 text-white/80">
            <Links />
          </div>
        </div>
      </div>
    );
  }

  /* ── Medium card: image left, content right ── */
  if (size === 'medium') {
    return (
      <div className="group h-full border border-foreground/10 hover:border-foreground/30 transition-colors duration-300 flex overflow-hidden">
        <div className="w-2/5 shrink-0 overflow-hidden">
          <img
            src={urlFor(work.image).width(600).url()}
            alt={work.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-between p-5 flex-1">
          <div className="space-y-2">
            <h3 className="font-serif text-lg leading-snug text-foreground">{work.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
          <div className="space-y-3 mt-4">
            <Tags />
            <Links />
          </div>
        </div>
      </div>
    );
  }

  /* ── Small card: image top, content below ── */
  return (
    <div className="group h-full border border-foreground/10 hover:border-foreground/30 transition-colors duration-300 flex flex-col overflow-hidden">
      <div className="aspect-video overflow-hidden">
        <img
          src={urlFor(work.image).width(500).url()}
          alt={work.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <h3 className="font-serif text-base leading-snug text-foreground">{work.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{desc}</p>
        <Tags />
        <Links />
      </div>
    </div>
  );
};

export default BentoCard;
