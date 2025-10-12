"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { PlusCircle, ImageIcon, Video, Users } from "lucide-react"

export default function PostTab() {
  const { username, profilePhoto } = useUser()
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setSelectedVideo(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedVideo(e.target?.result as string)
        setSelectedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = async () => {
    if (!username || (!content.trim() && !selectedImage && !selectedVideo)) return

    setIsPosting(true)

    try {
      const newPost: Post = {
        id: generateId(),
        username,
        content: content.trim(),
        timestamp: Date.now(),
        likes: [],
        dislikes: [],
        comments: [],
        image: selectedImage || undefined,
        video: selectedVideo || undefined,
      }

      const existingPosts = persistentStorage.getPosts()
      const updatedPosts = [newPost, ...existingPosts]
      persistentStorage.savePosts(updatedPosts)

      setContent("")
      setSelectedImage(null)
      setSelectedVideo(null)
    } catch (error) {
      console.error("Error posting:", error)
    } finally {
      setIsPosting(false)
    }
  }

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <PlusCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to create posts</h3>
          <p className="text-muted-foreground">Share your thoughts with the community</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="h-5 w-5" />
            Create Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profilePhoto || undefined} />
              <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
          </div>

          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          )}

          {selectedVideo && (
            <div className="relative">
              <video src={selectedVideo} controls className="w-full max-h-64 rounded-lg" />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex gap-2">
              <div>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Label htmlFor="image-upload">
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <span>
                      <ImageIcon className="h-4 w-4" />
                      Photo
                    </span>
                  </Button>
                </Label>
              </div>

              <div>
                <Input id="video-upload" type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                <Label htmlFor="video-upload">
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <span>
                      <Video className="h-4 w-4" />
                      Video
                    </span>
                  </Button>
                </Label>
              </div>

              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Tag
              </Button>
            </div>

            <Button
              onClick={handlePost}
              disabled={isPosting || (!content.trim() && !selectedImage && !selectedVideo)}
              className="px-6"
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tips for Great Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Share authentic moments and experiences</p>
            <p>• Use clear, high-quality images and videos</p>
            <p>• Engage with your community through comments</p>
            <p>• Be respectful and follow community guidelines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
