"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@/context/user-context"
import type { ThemeType } from "@/lib/types"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  isLoading: true,
})

export const useTheme = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { username } = useUser()
  const [theme, setTheme] = useState<ThemeType>("light")
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from API or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      if (!username) {
        // Use localStorage if not logged in
        const storedTheme = localStorage.getItem("fusionConnectTheme") as ThemeType | null
        if (storedTheme) {
          setTheme(storedTheme)
        }
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/theme?username=${encodeURIComponent(username)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.theme) {
            setTheme(data.theme as ThemeType)
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [username])

  // Save theme when it changes
  const handleSetTheme = async (newTheme: ThemeType) => {
    setTheme(newTheme)

    // Save to localStorage for non-logged in users
    localStorage.setItem("fusionConnectTheme", newTheme)

    if (username) {
      try {
        await fetch("/api/user/theme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, theme: newTheme }),
        })
      } catch (error) {
        console.error("Error saving theme:", error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isLoading }}>{children}</ThemeContext.Provider>
  )
}
