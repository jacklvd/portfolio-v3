'use client'
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight,
} from '@react-hook/window-size'

export default function useWindowDimensions() {
  const [windowWidth, windowHeight] = useWindowSize()

  return windowWidth
}
