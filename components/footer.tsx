'use client'
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/jacklvd',
      icon: <Github size={18} />,
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: <Linkedin size={18} />,
    },
    {
      name: 'Email',
      url: 'mailto:your.email@example.com',
      icon: <Mail size={18} />,
    },
  ]

  return (
    <footer className="w-full py-12 px-4">
      <div className="container mx-auto">
        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="font-medium text-lg">Jack Vo</h3>
            <p className="text-sm text-muted-foreground max-w-md text-center md:text-left">
              Computer Science student at University of Cincinnati, passionate
              about solving real world problems and building community-driven
              applications.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Built and Designed by Jack Vo
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
