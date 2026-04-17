// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { LoadingProvider } from '@/context/loading-context'
import { CursorProvider } from '@/components/cursor/cursor-provider'
import ClientAppContent from '@/components/client-app-content'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://jackvd.com'),
  title: {
    default: 'Jack Vo | Software Engineer',
    template: '%s | Jack Vo',
  },
  description:
    'Jack Vo is a Software Engineer passionate about solving real-world problems and building community-driven applications.',
  keywords: [
    'Jack Vo',
    'Software Engineer',
    'Full Stack Developer',
    'Computer Science',
    'Next.js',
    'React',
    'TypeScript',
  ],
  authors: [{ name: 'Jack Vo', url: 'https://github.com/jacklvd' }],
  creator: 'Jack Vo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jackvd.com',
    title: 'Jack Vo | Software Engineer',
    description:
      'Jack Vo is a Software Engineer passionate about solving real-world problems and building community-driven applications.',
    siteName: 'Jack Vo',
    images: [
      {
        url: '/images/hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'Jack Vo — Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jack Vo | Software Engineer',
    description:
      'Jack Vo is a Software Engineer passionate about solving real-world problems and building community-driven applications.',
    images: ['/images/hero.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingProvider>
            <CursorProvider>
              <ClientAppContent>{children}</ClientAppContent>
            </CursorProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
