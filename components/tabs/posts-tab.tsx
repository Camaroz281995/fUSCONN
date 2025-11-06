"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, MessageCircle, Share2, Send, ImageIcon, Video, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

interface Post {
  id: string
  username: string
  content: string
  timestamp: number
  likes: string[]
  comments: Comment[]
  type?: "text" | "photo" | "video" | "gif"
  mediaUrl?: string
}

interface Comment {
  id: string
  username: string
  content: string
  timestamp: number
}

interface PostsTabProps {
  username: string
}

const mediaCache = new Map<string, string>()

export default function PostsTab({ username }: PostsTabProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostType, setNewPostType] = useState<"text" | "photo" | "video" | "gif">("text")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>("")
  const [gifUrl, setGifUrl] = useState("")
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem("fusconn-global-posts")
      if (stored) {
        const allPosts = JSON.parse(stored)
        setPosts(allPosts.sort((a: Post, b: Post) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Error loading posts:", error)
    }
  }

  const savePosts = (updatedPosts: Post[]) => {
    try {
      // Store posts without media data in localStorage
      const postsToStore = updatedPosts.map((post) => ({
        ...post,
        mediaUrl: post.type === "gif" ? post.mediaUrl : undefined, // Keep GIF URLs, remove photo/video data
      }))
      localStorage.setItem("fusconn-global-posts", JSON.stringify(postsToStore))
      setPosts(updatedPosts.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error("Error saving posts:", error)
      alert("Unable to save post. Storage limit reached.")
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const objectUrl = URL.createObjectURL(file)
      setMediaPreview(objectUrl)
    }
  }

  const clearMedia = () => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaFile(null)
    setMediaPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePost = () => {
    if (!username) {
      alert("Please sign in to create posts")
      return
    }

    if (!newPostContent.trim() && !mediaPreview && !gifUrl) {
      alert("Please add some content to your post")
      return
    }

    let mediaId: string | undefined
    if (mediaPreview && newPostType !== "gif") {
      mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      mediaCache.set(mediaId, mediaPreview)
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      content: newPostContent,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      type: newPostType,
      mediaUrl: newPostType === "gif" ? gifUrl : mediaId,
    }

    const updatedPosts = [newPost, ...posts]
    savePosts(updatedPosts)
    setNewPostContent("")
    setMediaFile(null)
    setMediaPreview("")
    setGifUrl("")
    setNewPostType("text")
  }

  const handleLike = (postId: string) => {
    if (!username) {
      alert("Please sign in to like posts")
      return
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const likes = post.likes.includes(username)
          ? post.likes.filter((u) => u !== username)
          : [...post.likes, username]
        return { ...post, likes }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const handleComment = (postId: string) => {
    if (!username) {
      alert("Please sign in to comment")
      return
    }

    const commentText = commentInputs[postId]
    if (!commentText?.trim()) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username,
          content: commentText,
          timestamp: Date.now(),
        }
        return { ...post, comments: [...post.comments, newComment] }
      }
      return post
    })
    savePosts(updatedPosts)
    setCommentInputs({ ...commentInputs, [postId]: "" })
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getMediaUrl = (post: Post): string | undefined => {
    if (post.type === "gif") return post.mediaUrl
    if (post.mediaUrl) return mediaCache.get(post.mediaUrl)
    return undefined
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={newPostType} onValueChange={(v) => setNewPostType(v as any)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="gif">GIF</TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              <Textarea
                placeholder={username ? "What's on your mind?" : "Sign in to create posts"}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                disabled={!username}
              />

              {newPostType === "photo" && (
                <div>
                  <input
                    ref={fileInputRef}
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 relative">
                      {mediaPreview ? (
                        <>
                          <img
                            src={mediaPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.preventDefault()
                              clearMedia()
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload photo</p>
                        </>
                      )}
                    </div>
                  </Label>
                </div>
              )}

              {newPostType === "video" && (
                <div>
                  <input
                    ref={fileInputRef}
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 relative">
                      {mediaPreview ? (
                        <>
                          <video src={mediaPreview} controls className="max-h-64 mx-auto rounded" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.preventDefault()
                              clearMedia()
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload video from camera roll</p>
                        </>
                      )}
                    </div>
                  </Label>
                </div>
              )}

              {newPostType === "gif" && (
                <div className="space-y-2">
                  <Input
                    placeholder="Paste GIF URL (e.g., from Giphy)"
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                  />
                  {gifUrl && (
                    <div className="relative">
                      <img src={gifUrl || "/placeholder.svg"} alt="GIF Preview" className="max-h-64 mx-auto rounded" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setGifUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handlePost} disabled={!username} className="w-full">
                Post
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => {
          const mediaUrl = getMediaUrl(post)
          return (
            <Card key={post.id} className="bg-white shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {post.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">@{post.username}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(post.timestamp)}</p>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{post.content}</p>

                    {mediaUrl && post.type === "photo" && (
                      <img
                        src={mediaUrl || "/placeholder.svg"}
                        alt="Post"
                        className="mt-3 rounded-lg max-h-96 w-full object-cover"
                      />
                    )}

                    {mediaUrl && post.type === "video" && (
                      <video src={mediaUrl} controls className="mt-3 rounded-lg max-h-96 w-full" />
                    )}

                    {mediaUrl && post.type === "gif" && (
                      <img
                        src={mediaUrl || "/placeholder.svg"}
                        alt="GIF"
                        className="mt-3 rounded-lg max-h-96 w-full object-contain"
                      />
                    )}

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.likes.includes(username) ? "text-blue-600" : ""}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-semibold">@{comment.username}</span>
                            <span className="ml-2">{comment.content}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{formatTime(comment.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder={username ? "Write a comment..." : "Sign in to comment"}
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                        disabled={!username}
                        className="flex-1"
                      />
                      <Button onClick={() => handleComment(post.id)} size="sm" disabled={!username}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
