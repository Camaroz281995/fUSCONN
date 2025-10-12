"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import DevicePhotoUpload from "./device-photo-upload"
import { ImageIcon, LinkIcon, SearchIcon } from "lucide-react"

interface PhotoUploadFieldProps {
  onImageSelect: (url: string | null) => void
  onGifSelect: (url: string | null) => void
  selectedImage: string | null
  selectedGif: string | null
}

const SAMPLE_GIFS = [
  "/placeholder.svg?height=200&width=300&text=Happy+GIF",
  "/placeholder.svg?height=200&width=300&text=Excited+GIF",
  "/placeholder.svg?height=200&width=300&text=Thumbs+Up+GIF",
  "/placeholder.svg?height=200&width=300&text=Dancing+GIF",
  "/placeholder.svg?height=200&width=300&text=Celebration+GIF",
  "/placeholder.svg?height=200&width=300&text=Love+GIF",
]

export default function PhotoUploadField({
  onImageSelect,
  onGifSelect,
  selectedImage,
  selectedGif,
}: PhotoUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [gifSearchQuery, setGifSearchQuery] = useState("")

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageSelect(imageUrl.trim())
      setImageUrl("")
    }
  }

  const handleGifSelect = (gifUrl: string) => {
    onGifSelect(gifUrl)
  }

  const clearSelection = () => {
    onImageSelect(null)
    onGifSelect(null)
  }

  const filteredGifs = SAMPLE_GIFS.filter((gif) => gif.toLowerCase().includes(gifSearchQuery.toLowerCase()))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="gif">GIF</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <DevicePhotoUpload onImageSelect={onImageSelect} selectedImage={selectedImage} />
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
                <LinkIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gif" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gif-search">Search GIFs</Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="gif-search"
                placeholder="Search for GIFs..."
                value={gifSearchQuery}
                onChange={(e) => setGifSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {filteredGifs.map((gif, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handleGifSelect(gif)}
              >
                <CardContent className="p-2">
                  <img
                    src={gif || "/placeholder.svg"}
                    alt={`GIF ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGifs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No GIFs found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {(selectedImage || selectedGif) && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{selectedImage ? "Image selected" : "GIF selected"}</span>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
