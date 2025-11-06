"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { useEffect } from "react"

export default function BackgroundControls() {
  const { backgroundPhoto } = useUser()
  const [opacity, setOpacity] = useState(40)
  const [blur, setBlur] = useState(2)
  const [isVisible, setIsVisible] = useState(true)

  // Apply controls to the background overlay
  useEffect(() => {
    if (typeof document === "undefined") return

    const overlay = document.querySelector(".bg-background\\/40") as HTMLElement
    if (!overlay) return

    if (isVisible && backgroundPhoto) {
      overlay.style.backgroundColor = `rgba(var(--background) / ${opacity / 100})`
      overlay.style.backdropFilter = `blur(${blur}px)`
    } else {
      // If background is hidden, make overlay fully opaque
      overlay.style.backgroundColor = `rgba(var(--background) / 1)`
      overlay.style.backdropFilter = "none"
    }

    return () => {
      // Reset on unmount
      overlay.style.backgroundColor = ""
      overlay.style.backdropFilter = ""
    }
  }, [opacity, blur, isVisible, backgroundPhoto])

  const handleReset = () => {
    setOpacity(40)
    setBlur(2)
    setIsVisible(true)

    const overlay = document.querySelector(".bg-background\\/40") as HTMLElement
    if (overlay) {
      overlay.style.backgroundColor = `rgba(var(--background) / 0.4)`
      overlay.style.backdropFilter = `blur(2px)`
    }
  }

  if (!backgroundPhoto) {
    return <div className="text-center py-4 text-muted-foreground">Upload a background image to access controls</div>
  }

  return (
    <Card className="card-transparent">
      <CardContent className="py-4">
        <Tabs defaultValue="opacity">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="opacity">Opacity</TabsTrigger>
            <TabsTrigger value="blur">Blur</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="opacity" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="opacity-slider">Background Overlay Opacity</Label>
                <span className="text-sm text-muted-foreground">{opacity}%</span>
              </div>
              <Slider
                id="opacity-slider"
                min={0}
                max={100}
                step={5}
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
              />
              <p className="text-xs text-muted-foreground">Lower values make the background more visible</p>
            </div>
          </TabsContent>

          <TabsContent value="blur" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="blur-slider">Background Blur</Label>
                <span className="text-sm text-muted-foreground">{blur}px</span>
              </div>
              <Slider
                id="blur-slider"
                min={0}
                max={10}
                step={1}
                value={[blur]}
                onValueChange={(value) => setBlur(value[0])}
              />
              <p className="text-xs text-muted-foreground">Higher values increase the blur effect</p>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4">
            <div className="space-y-2">
              <Button onClick={() => setIsVisible(!isVisible)} variant="outline" className="w-full">
                {isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Background
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Background
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">Toggle background visibility</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
