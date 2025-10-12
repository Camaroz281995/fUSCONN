"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react"
import type { Story } from "@/lib/types"

interface StoryViewerProps {
  story: Story
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function StoryViewer({ story, onClose, onNext, onPrevious }: StoryViewerProps) {
  const { username } = useUser()
  const [progress, setProgress] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const duration = 5000 // 5 seconds for each story
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onNext()
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onNext])

  const handleLike = () => {
    setIsLiked(!isLiked)
    // In a real app, this would update the story's likes
  }

  const timeAgo = formatDate(story.timestamp)
  const isOwnStory = story.username === username

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Story Content */}
      <div className="relative w-full max-w-md h-full bg-black">
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Progress value={progress} className="h-1 bg-white/30" />
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 ring-2 ring-white">
              <AvatarFallback className="text-xs">{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-sm">{story.username}</p>
              <p className="text-white/70 text-xs">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Story Media */}
        <div className="relative w-full h-full flex items-center justify-center">
          {story.imageUrl && (
            <img src={story.imageUrl || "/placeholder.svg"} alt="Story" className="w-full h-full object-cover" />
          )}

          {story.videoUrl && <video src={story.videoUrl} autoPlay muted loop className="w-full h-full object-cover" />}

          {!story.imageUrl && !story.videoUrl && (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-8">
              <p className="text-white text-xl text-center font-medium">{story.content}</p>
            </div>
          )}

          {/* Content Overlay */}
          {story.content && (story.imageUrl || story.videoUrl) && (
            <div className="absolute bottom-20 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white text-sm">{story.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 flex items-center justify-start pl-4">
            <Button variant="ghost" size="icon" onClick={onPrevious} className="text-white hover:bg-white/20">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-end pr-4">
            <Button variant="ghost" size="icon" onClick={onNext} className="text-white hover:bg-white/20">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        {!isOwnStory && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`text-white hover:bg-white/20 ${isLiked ? "text-red-500" : ""}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Story Info for Own Stories */}
        {isOwnStory && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between text-white text-sm">
                <span>{story.viewers.length} views</span>
                <span>Expires in {Math.ceil((story.expiresAt - Date.now()) / (1000 * 60 * 60))}h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
