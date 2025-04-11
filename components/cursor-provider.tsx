'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import AdvancedCursor from './cursor'

type CursorContextType = {
  enabled: boolean
  enableCustomCursor: () => void
  disableCustomCursor: () => void
  toggleCustomCursor: () => void
}

const CursorContext = createContext<CursorContextType>({
  enabled: true,
  enableCustomCursor: () => {},
  disableCustomCursor: () => {},
  toggleCustomCursor: () => {},
})

export const useCursor = () => useContext(CursorContext)

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if this is a touch device
    const checkTouch = () => {
      const isTouchCapable =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      setIsTouchDevice(isTouchCapable)
    }

    checkTouch()
    window.addEventListener('resize', checkTouch)

    return () => {
      window.removeEventListener('resize', checkTouch)
    }
  }, [])

  const enableCustomCursor = () => setEnabled(true)
  const disableCustomCursor = () => setEnabled(false)
  const toggleCustomCursor = () => setEnabled((prev) => !prev)

  // Don't render custom cursor on touch devices
  const shouldRenderCursor = isMounted && enabled && !isTouchDevice

  return (
    <CursorContext.Provider
      value={{
        enabled,
        enableCustomCursor,
        disableCustomCursor,
        toggleCustomCursor,
      }}
    >
      {children}
      {shouldRenderCursor && <AdvancedCursor />}
    </CursorContext.Provider>
  )
}
