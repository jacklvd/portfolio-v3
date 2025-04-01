// context/loading-context.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type LoadingContextType = {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  hasVisited: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false) // Start with false for SSR
  const [hasVisited, setHasVisited] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Only run client-side code after component is mounted
    if (typeof window !== 'undefined') {
      try {
        const visited = localStorage.getItem('has_visited')
        const isFirstVisit = !visited

        if (isFirstVisit) {
          setIsLoading(true)
          const timer = setTimeout(() => {
            setIsLoading(false)
            localStorage.setItem('has_visited', 'true')
            setHasVisited(true)
          }, 2000)

          return () => clearTimeout(timer)
        } else {
          setIsLoading(false)
          setHasVisited(true)
        }
      } catch (error) {
        // Handle localStorage errors (e.g., in private browsing)
        console.error('localStorage error:', error)
        setIsLoading(false)
      }
    }
  }, [])

  // Provide a stable value for SSR
  const value = {
    isLoading: isMounted ? isLoading : false,
    setIsLoading,
    hasVisited: isMounted ? hasVisited : false,
  }

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
