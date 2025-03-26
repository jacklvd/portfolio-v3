import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/navbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import Loading from '@/components/loading'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
// import { Toaster } from '@/components/ui/toaster'

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
          <TooltipProvider delayDuration={0}>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Suspense fallback={<Loading />}>{children}</Suspense>
            {/* <Toaster /> */}
            <NavBar />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
