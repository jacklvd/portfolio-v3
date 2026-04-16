// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LoadingProvider } from '@/context/loading-context'
import { CursorProvider } from '@/components/cursor-provider'
import ClientAppContent from '@/components/client-app-content'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

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
