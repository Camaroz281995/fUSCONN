"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GifSearchProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

// Mock GIF data for demo purposes
const TRENDING_GIFS = [
  {
    id: "1",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
  {
    id: "2",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
  {
    id: "3",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
  {
    id: "4",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
  {
    id: "5",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
  {
    id: "6",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bWx4Ym51ZXgydWN0ZHE2aXJ5ZnR5cWxveTdyaWFxbWt1aXdpZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aCTfyhHfLEeBp2U/giphy.gif",
  },
]

export default function GifSearch({ onSelect, onClose }: GifSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [gifs, setGifs] = useState(TRENDING_GIFS)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would call a GIF API like Giphy or Tenor
      // For demo purposes, we'll just use the mock data
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      // Mock search results
      setGifs(TRENDING_GIFS)
    } catch (error) {
      console.error("Error searching GIFs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    // Load trending GIFs on mount
    setGifs(TRENDING_GIFS)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search GIFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <Button size="sm" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <div
                key={gif.id}
                className="aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                onClick={() => onSelect(gif.url)}
              >
                <img src={gif.url || "/placeholder.svg"} alt="GIF" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
