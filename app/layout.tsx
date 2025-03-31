// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { LoadingProvider } from '@/context/loading-context'
import ClientAppContent from '@/components/client-app-content'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Jack Vo | Software Engineer',
    template: '%s | Jack Vo',
  },
  description: 'Jack Vo is a Software Engineer.',
  authors: [{ name: 'Jack Vo', url: 'https://github.com/jacklvd' }],
  creator: 'Jack Vo',
  publisher: 'Jack Vo',
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingProvider>
            <ClientAppContent>{children}</ClientAppContent>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}