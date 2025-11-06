"use client"

import type React from "react"

import { useTheme } from "@/context/theme-context"
import { Card } from "@/components/ui/card"
import { Moon, Sun, Zap, Palette } from "lucide-react"
import type { ThemeType } from "@/lib/types"

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes: { id: ThemeType; name: string; icon: React.ReactNode; description: string }[] = [
    {
      id: "light",
      name: "Light",
      icon: <Sun className="h-5 w-5" />,
      description: "Clean and bright interface",
    },
    {
      id: "dark",
      name: "Dark",
      icon: <Moon className="h-5 w-5" />,
      description: "Easy on the eyes",
    },
    {
      id: "retro",
      name: "Retro",
      icon: <Palette className="h-5 w-5" />,
      description: "Nostalgic vintage style",
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      icon: <Zap className="h-5 w-5" />,
      description: "Futuristic neon aesthetic",
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Theme Customization</h3>
      <p className="text-sm text-muted-foreground">Choose a theme for your Fusion Connect experience</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((themeOption) => (
          <Card
            key={themeOption.id}
            className={`p-4 cursor-pointer transition-all ${
              theme === themeOption.id ? "ring-2 ring-primary ring-offset-2" : "hover:bg-muted/50"
            }`}
            onClick={() => setTheme(themeOption.id)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${theme === themeOption.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {themeOption.icon}
              </div>
              <div>
                <h4 className="font-medium">{themeOption.name}</h4>
                <p className="text-xs text-muted-foreground">{themeOption.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
