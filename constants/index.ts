import { Icons } from '@/components/icons'
import {
  CodeIcon,
  HomeIcon,
  Link,
  NotebookIcon,
  PencilLine,
  BookImage,
} from 'lucide-react'

export const data = {
  navbar: [
    { title: 'jackvd', href: '/', icon: HomeIcon },
    { title: 'meet-jack', href: '/meet-jack', icon: NotebookIcon },
    { title: 'blog', href: 'https://blog.jackvd.com/', icon: PencilLine },
  ],
  social: {
    GitHub: {
      name: 'GitHub',
      url: 'https://github.com/jacklvd',
      icon: Icons.github,
      navbar: true,
    },
    LinkedIn: {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/itsmejack/',
      icon: Icons.linkedin,
      navbar: true,
    },
    email: {
      name: 'Email',
      url: 'mailto:vodnglg@gmail.com',
      icon: Icons.email,
      navbar: true,
    },
  },
}
