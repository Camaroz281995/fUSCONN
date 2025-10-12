"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Video } from "lucide-react"

interface DeviceVideoUploadProps {
  onVideoSelect: (url: string | null) => void
  selectedVideo: string | null
}

export default function DeviceVideoUpload({ onVideoSelect, selectedVideo }: DeviceVideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onVideoSelect(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith("video/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onVideoSelect(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const clearVideo = () => {
    onVideoSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {selectedVideo ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video src={selectedVideo} controls className="w-full max-h-64 object-cover rounded">
                Your browser does not support the video tag.
              </video>
              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={clearVideo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Video</h3>
            <p className="text-muted-foreground text-center mb-4">Drag and drop a video here, or click to select</p>
            <Button variant="outline">Choose File</Button>
          </CardContent>
        </Card>
      )}

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
