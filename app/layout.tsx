import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavBar } from './components/navbar'
import { TooltipProvider } from '@/app/components/ui/tooltip'
import Loading from './components/ui/loading'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'jackvd',
  description: 'Jack Personal Vault',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider delayDuration={0}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
          <NavBar />
        </TooltipProvider>
      </body>
    </html>
  )
}
