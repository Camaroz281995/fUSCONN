"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Video, Play, Search, Plus, Heart, MessageCircle, Share2, AlertCircle, Upload, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface VideoPost {
  id: string
  username: string
  title: string
  description: string
  videoUrl?: string
  thumbnailUrl: string
  views: number
  likes: string[]
  comments: VideoComment[]
  timestamp: number
}

interface VideoComment {
  id: string
  username: string
  content: string
  timestamp: number
}

interface VideosTabProps {
  username: string
}

const videoCache = new Map<string, string>()

export default function VideosTab({ username }: VideosTabProps) {
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null)
  const [commentText, setCommentText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = () => {
    try {
      const stored = localStorage.getItem("fusconn-global-videos")
      if (stored) {
        setVideos(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading videos:", error)
    }
  }

  const saveVideos = (updatedVideos: VideoPost[]) => {
    try {
      // Store videos without video data in localStorage
      const videosToStore = updatedVideos.map((video) => ({
        ...video,
        videoUrl: undefined, // Remove video data
      }))
      localStorage.setItem("fusconn-global-videos", JSON.stringify(videosToStore))
      setVideos(updatedVideos)
    } catch (error) {
      console.error("Error saving videos:", error)
      alert("Unable to save video. Storage limit reached.")
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file")
      return
    }

    setVideoFile(file)
    const objectUrl = URL.createObjectURL(file)
    setVideoPreview(objectUrl)
  }

  const clearVideo = () => {
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadVideo = () => {
    if (!username) {
      alert("Please sign in to upload videos")
      return
    }

    if (!newTitle.trim()) {
      alert("Please enter a title")
      return
    }

    if (!videoPreview) {
      alert("Please select a video to upload")
      return
    }

    const videoId = `video-${Date.now()}`
    videoCache.set(videoId, videoPreview)

    const newVideo: VideoPost = {
      id: videoId,
      username,
      title: newTitle.trim(),
      description: newDescription.trim(),
      videoUrl: videoId, // Store ID instead of data
      thumbnailUrl: "",
      views: 0,
      likes: [],
      comments: [],
      timestamp: Date.now(),
    }

    const updatedVideos = [newVideo, ...videos]
    saveVideos(updatedVideos)

    setNewTitle("")
    setNewDescription("")
    clearVideo()
    setShowUploadDialog(false)
  }

  const handleLikeVideo = (videoId: string) => {
    if (!username) {
      alert("Please sign in to like videos")
      return
    }

    const updatedVideos = videos.map((video) => {
      if (video.id === videoId) {
        const likes = video.likes.includes(username)
          ? video.likes.filter((u) => u !== username)
          : [...video.likes, username]
        return { ...video, likes }
      }
      return video
    })

    saveVideos(updatedVideos)
  }

  const handleAddComment = () => {
    if (!username || !selectedVideo) {
      alert("Please sign in to comment")
      return
    }

    if (!commentText.trim()) return

    const newComment: VideoComment = {
      id: `comment-${Date.now()}`,
      username,
      content: commentText.trim(),
      timestamp: Date.now(),
    }

    const updatedVideos = videos.map((video) => {
      if (video.id === selectedVideo.id) {
        return {
          ...video,
          comments: [...video.comments, newComment],
        }
      }
      return video
    })

    saveVideos(updatedVideos)
    setCommentText("")
  }

  const handleViewVideo = (video: VideoPost) => {
    const updatedVideos = videos.map((v) => {
      if (v.id === video.id) {
        return { ...v, views: v.views + 1 }
      }
      return v
    })
    saveVideos(updatedVideos)
    setSelectedVideo(video)
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getVideoUrl = (videoId: string): string | undefined => {
    return videoCache.get(videoId)
  }

  if (selectedVideo) {
    const videoUrl = getVideoUrl(selectedVideo.id)
    return (
      <div className="space-y-4">
        <Button onClick={() => setSelectedVideo(null)} variant="outline">
          ← Back to Videos
        </Button>

        <Card className="bg-white shadow-md">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-900">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video no longer available (session expired)</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedVideo.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">@{selectedVideo.username}</p>
                    <p className="text-sm text-muted-foreground">{selectedVideo.views} views</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 py-3 border-y">
                <button
                  onClick={() => handleLikeVideo(selectedVideo.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    username && selectedVideo.likes.includes(username)
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${username && selectedVideo.likes.includes(username) ? "fill-current" : ""}`}
                  />
                  <span>{selectedVideo.likes.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5" />
                  <span>{selectedVideo.comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {selectedVideo.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground">{selectedVideo.description}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-4">{selectedVideo.comments.length} Comments</h3>

                {username ? (
                  <div className="flex items-start gap-2 mb-6">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment()
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleAddComment} className="mt-2">
                        Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-3 bg-yellow-50 rounded-lg text-center">
                    <p className="text-sm text-gray-700">Sign in to leave a comment</p>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedVideo.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">@{comment.username}</span>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Video className="h-6 w-6" />
              Videos
            </CardTitle>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Video</DialogTitle>
                </DialogHeader>
                {!username ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Please sign in to upload videos</p>
                    <Button onClick={() => setShowUploadDialog(false)}>Close</Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-title">Title</Label>
                      <Input
                        id="video-title"
                        placeholder="Enter video title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video-description">Description</Label>
                      <Textarea
                        id="video-description"
                        placeholder="Describe your video..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video File</Label>
                      <input
                        ref={fileInputRef}
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                      <Label htmlFor="video-file" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 relative">
                          {videoPreview ? (
                            <>
                              <video src={videoPreview} controls className="max-h-48 mx-auto rounded" />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                  e.preventDefault()
                                  clearVideo()
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">Click to select video from camera roll</p>
                            </>
                          )}
                        </div>
                      </Label>
                    </div>
                    <Button onClick={handleUploadVideo} disabled={!newTitle.trim() || !videoPreview} className="w-full">
                      Upload Video
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredVideos.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to upload a video!</p>
            <Button onClick={() => setShowUploadDialog(true)}>Upload Video</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewVideo(video)}
            >
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <Play className="h-12 w-12 text-white" />
                <Badge className="absolute top-2 right-2 bg-black/70">{video.views} views</Badge>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{video.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">@{video.username}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {video.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {video.comments.length}
                      </span>
                      <span>{formatTimestamp(video.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
