// components/client-app-content.tsx
'use client'
import { useEffect, useState, Suspense } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { NavBar } from '@/components/layout/navbar'
import Preloader from '@/components/loading/preloader'

export default function ClientAppContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
      {isMounted ? <AppLoader>{children}</AppLoader> : children}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <NavBar />
    </TooltipProvider>
  )
}

function AppLoader({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  // const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [preloaderDone, setPreloaderDone] = useState(false)

  useEffect(() => {
    // try {
    //   const visited = localStorage.getItem('has_visited')
    //   if (!visited) setIsFirstVisit(true)
    // } catch {
    //   // localStorage unavailable (private browsing, etc.)
    // }
    setMounted(true)
  }, [])

  return (
    <>
      <Suspense fallback={null}>{children}</Suspense>
      {mounted && !preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}
    </>
  )
}
