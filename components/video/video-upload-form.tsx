"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import VideoUploadField from "@/components/video/video-upload-field"

interface VideoUploadFormProps {
  onVideoUploaded: () => void
}

export default function VideoUploadForm({ onVideoUploaded }: VideoUploadFormProps) {
  const { username } = useUser()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleVideoUploaded = (url: string) => {
    setVideoUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setError("Please set your username in the Profile tab")
      return
    }

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!videoUrl) {
      setError("Please upload a video")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          title,
          description,
          url: videoUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save video")
      }

      // Reset form
      setTitle("")
      setDescription("")
      setVideoUrl("")

      // Notify parent
      onVideoUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Description</Label>
            <Textarea
              id="video-description"
              placeholder="Describe your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Video</Label>
            <VideoUploadField onVideoUploaded={handleVideoUploaded} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={isSubmitting || !videoUrl || !title.trim() || !username} className="w-full">
            {isSubmitting ? "Saving..." : "Save Video"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
