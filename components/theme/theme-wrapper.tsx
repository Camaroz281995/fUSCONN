"use client"

import { useTheme } from "@/context/theme-provider"
import { useUser } from "@/context/user-context"
import { useEffect, useState, type ReactNode } from "react"

interface ThemeWrapperProps {
  children: ReactNode
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme, isLoading } = useTheme()
  const { backgroundPhoto } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Apply theme classes to the document
  useEffect(() => {
    if (!isMounted || isLoading) return

    // Remove all theme classes
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-retro", "theme-cyberpunk")

    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`)

    // Update color scheme for browser
    if (theme === "dark" || theme === "cyberpunk") {
      document.documentElement.style.colorScheme = "dark"
    } else {
      document.documentElement.style.colorScheme = "light"
    }
  }, [theme, isLoading, isMounted])

  // Apply background photo to the body element
  useEffect(() => {
    if (!isMounted) return

    if (backgroundPhoto) {
      // Apply background with a slight fade-in effect
      document.body.style.transition = "background-image 0.3s ease-in-out"
      document.body.style.backgroundImage = `url(${backgroundPhoto})`
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
      document.body.style.backgroundAttachment = "fixed"
      document.body.style.backgroundRepeat = "no-repeat"
      document.body.style.height = "100%"
      document.documentElement.style.height = "100%"
    } else {
      document.body.style.backgroundImage = "none"
    }

    // Clean up function
    return () => {
      document.body.style.transition = ""
    }
  }, [backgroundPhoto, isMounted])

  // Don't render anything during SSR to avoid hydration mismatches
  if (!isMounted) {
    return null
  }

  return (
    <div className={`theme-${theme} min-h-screen`}>
      {/* Reduced overlay opacity from 90% to 40% to make background more visible */}
      <div className="min-h-screen bg-background/40 backdrop-blur-[2px]">{children}</div>
    </div>
  )
}
