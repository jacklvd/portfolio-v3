// components/client-app-content.tsx
'use client'
import { useEffect, useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import Loading from '@/components/loading'
import SkeletonLoading from '@/components/skeletonloading'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { NavBar } from '@/components/navbar'
import { useLoading } from '@/context/loading-context'

export default function ClientAppContent({
  children,
}: {
  children: React.ReactNode
}) {
  // Add isMounted state to prevent hydration mismatch
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
      {/* <Toaster /> */}
      <NavBar />
    </TooltipProvider>
  )
}

function AppLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading()

  return (
    <>
      {isLoading ? (
        <SkeletonLoading />
      ) : (
        <Suspense fallback={<Loading />}>{children}</Suspense>
      )}
    </>
  )
}
