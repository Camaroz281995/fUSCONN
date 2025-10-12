"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, Share2, Send, Sparkles, Camera, Video } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import type { Post, Comment } from "@/lib/types"

export default function GlobalFeed() {
  const { username } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPosts()

    // Simulate P2P post sync
    const interval = setInterval(() => {
      syncP2PPosts()
    }, 10000) // Sync every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadPosts = () => {
    const allPosts = persistentStorage.getPosts()
    setPosts(allPosts.sort((a, b) => b.timestamp - a.timestamp))
  }

  const syncP2PPosts = () => {
    // Simulate P2P post synchronization across devices
    // In a real P2P implementation, this would sync with connected peers
    console.log("Syncing posts across P2P network...")
    loadPosts()
  }

  const handleCreatePost = () => {
    if (!newPost.trim() || !username) return

    const post: Post = {
      id: Date.now().toString(),
      username,
      content: newPost.trim(),
      timestamp: Date.now(),
      likes: [],
      dislikes: [],
      comments: [],
      hashtags: extractHashtags(newPost),
      mentions: extractMentions(newPost),
    }

    // Save locally and broadcast to P2P network
    persistentStorage.savePost(post)
    broadcastPostP2P(post)

    setNewPost("")
    loadPosts()
  }

  const broadcastPostP2P = (post: Post) => {
    // Simulate P2P post broadcasting to all connected devices
    console.log("Broadcasting post to P2P network:", post)

    // Simulate post propagation to other devices
    setTimeout(() => {
      // In a real implementation, this would handle post replication
      console.log("Post replicated across network")
    }, 1000)
  }

  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#\w+/g)
    return hashtags ? hashtags.map((tag) => tag.slice(1)) : []
  }

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@\w+/g)
    return mentions ? mentions.map((mention) => mention.slice(1)) : []
  }

  const handleLike = (postId: string) => {
    if (!username) return
    persistentStorage.toggleLike(postId, username)
    loadPosts()
  }

  const handleComment = (postId: string) => {
    const commentText = commentInputs[postId]
    if (!commentText?.trim() || !username) return

    const comment: Comment = {
      id: Date.now().toString(),
      username,
      content: commentText.trim(),
      timestamp: Date.now(),
      likes: [],
    }

    persistentStorage.addComment(postId, comment)
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    loadPosts()
  }

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            P2P Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {username && (
            <div className="space-y-3">
              <Textarea
                placeholder="What's happening? Share with the P2P network..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Broadcast
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts in the P2P network yet</p>
                <p className="text-xs">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persistentStorage.getProfilePhoto(post.username) || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {getInitials(post.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">@{post.username}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(post.timestamp)}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            P2P
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{post.content}</p>

                        {post.image && (
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt="Post content"
                            className="w-full max-h-96 object-cover rounded-lg"
                          />
                        )}

                        {post.video && <video src={post.video} controls className="w-full max-h-96 rounded-lg" />}

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {post.mentions && post.mentions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.mentions.map((mention, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                @{mention}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 ${
                              post.likes?.includes(username || "") ? "text-red-500" : ""
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 ${post.likes?.includes(username || "") ? "fill-current" : ""}`}
                            />
                            <span className="text-xs">{post.likes?.length || 0}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center space-x-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">{post.comments?.length || 0}</span>
                          </Button>

                          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                            <Share2 className="h-4 w-4" />
                            <span className="text-xs">Share</span>
                          </Button>
                        </div>

                        {showComments[post.id] && (
                          <div className="space-y-3 pt-3 border-t">
                            {post.comments && post.comments.length > 0 && (
                              <div className="space-y-2">
                                {post.comments.map((comment) => (
                                  <div key={comment.id} className="flex items-start space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={persistentStorage.getProfilePhoto(comment.username) || undefined}
                                      />
                                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                                        {getInitials(comment.username)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-muted rounded-lg px-3 py-2">
                                        <p className="font-semibold text-xs">@{comment.username}</p>
                                        <p className="text-sm">{comment.content}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatTime(comment.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {username && (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={persistentStorage.getProfilePhoto(username) || undefined} />
                                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                    {getInitials(username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex items-center space-x-2">
                                  <Textarea
                                    placeholder="Write a comment..."
                                    value={commentInputs[post.id] || ""}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                    }
                                    className="min-h-[60px] resize-none text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
