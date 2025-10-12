"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DevicePhotoUpload from "@/components/photo/device-photo-upload"
import DeviceVideoUpload from "@/components/video/device-video-upload"
import { generateId } from "@/lib/utils"
import { ArrowLeft, Send, Type, ImageIcon, Video } from "lucide-react"
import type { Story } from "@/lib/types"

interface CreateStoryProps {
  onClose: () => void
}

export default function CreateStory({ onClose }: CreateStoryProps) {
  const { username } = useUser()
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!username || (!content.trim() && !imageUrl && !videoUrl)) return

    setIsSubmitting(true)

    try {
      const newStory: Story = {
        id: generateId(),
        username,
        content: content.trim(),
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        viewers: [],
      }

      // In a real app, this would save to persistent storage
      console.log("Creating story:", newStory)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onClose()
    } catch (error) {
      console.error("Error creating story:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasContent = content.trim() || imageUrl || videoUrl

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          Create Story
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger value="photo">
              <ImageIcon className="h-4 w-4 mr-1" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-1" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Share what's on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-sm text-muted-foreground">{content.length}/500</div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <Textarea
              placeholder="Add a caption..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <DevicePhotoUpload onImageSelect={setImageUrl} selectedImage={imageUrl} />
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Textarea
              placeholder="Add a caption..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <DeviceVideoUpload onVideoSelect={setVideoUrl} selectedVideo={videoUrl} />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasContent || isSubmitting} className="flex-1">
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? "Sharing..." : "Share Story"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">Your story will be visible for 24 hours</div>
      </CardContent>
    </Card>
  )
}
