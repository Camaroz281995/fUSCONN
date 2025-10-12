"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId, formatTimeAgo } from "@/lib/utils"
import type { Post, Comment } from "@/lib/types"
import { Heart, MessageCircle, Share, Search, ThumbsUp, ThumbsDown, Send, Sparkles, TrendingUp } from "lucide-react"

export default function SmartFeed() {
  const { username, profilePhoto } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "trending" | "recent">("all")
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [likeAnimations, setLikeAnimations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    const allPosts = persistentStorage.getPosts()
    setPosts(allPosts.sort((a, b) => b.timestamp - a.timestamp))
  }

  const handleLike = (postId: string) => {
    if (!username) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const likes = post.likes || []
        const dislikes = post.dislikes || []

        if (likes.includes(username)) {
          return { ...post, likes: likes.filter((u) => u !== username) }
        } else {
          // Add like animation
          setLikeAnimations((prev) => new Set([...prev, postId]))
          setTimeout(() => {
            setLikeAnimations((prev) => {
              const newSet = new Set(prev)
              newSet.delete(postId)
              return newSet
            })
          }, 1000)

          return {
            ...post,
            likes: [...likes, username],
            dislikes: dislikes.filter((u) => u !== username),
          }
        }
      }
      return post
    })

    setPosts(updatedPosts)
    persistentStorage.savePosts(updatedPosts)
  }

  const handleDislike = (postId: string) => {
    if (!username) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const likes = post.likes || []
        const dislikes = post.dislikes || []

        if (dislikes.includes(username)) {
          return { ...post, dislikes: dislikes.filter((u) => u !== username) }
        } else {
          return {
            ...post,
            dislikes: [...dislikes, username],
            likes: likes.filter((u) => u !== username),
          }
        }
      }
      return post
    })

    setPosts(updatedPosts)
    persistentStorage.savePosts(updatedPosts)
  }

  const handleComment = (postId: string) => {
    if (!username || !newComment.trim()) return

    const comment: Comment = {
      id: generateId(),
      username,
      content: newComment.trim(),
      timestamp: Date.now(),
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, comments: [...(post.comments || []), comment] }
      }
      return post
    })

    setPosts(updatedPosts)
    persistentStorage.savePosts(updatedPosts)
    setNewComment("")
  }

  const getFilteredPosts = () => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    switch (filterType) {
      case "trending":
        return filtered.sort(
          (a, b) =>
            (b.likes?.length || 0) + (b.comments?.length || 0) - ((a.likes?.length || 0) + (a.comments?.length || 0)),
        )
      case "recent":
        return filtered.sort((a, b) => b.timestamp - a.timestamp)
      default:
        return filtered
    }
  }

  const filteredPosts = getFilteredPosts()

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            SmartFeed
          </CardTitle>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="flex-1"
              >
                All
              </Button>
              <Button
                variant={filterType === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("trending")}
                className="flex-1"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Button>
              <Button
                variant={filterType === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("recent")}
                className="flex-1"
              >
                Recent
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="relative overflow-hidden">
              {likeAnimations.has(post.id) && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-red-500 animate-float" fill="currentColor" />
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profilePhoto || undefined} />
                    <AvatarFallback className="text-sm">{post.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{post.username}</p>
                      <Badge variant="secondary" className="text-xs">
                        {formatTimeAgo(post.timestamp)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <p className="text-sm leading-relaxed">{post.content}</p>

                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post image"
                      className="w-full h-auto max-h-64 object-cover"
                    />
                  </div>
                )}

                {post.video && (
                  <div className="rounded-lg overflow-hidden">
                    <video src={post.video} controls className="w-full h-auto max-h-64" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`gap-1 ${post.likes?.includes(username || "") ? "text-red-500" : ""}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDislike(post.id)}
                      className={`gap-1 ${post.dislikes?.includes(username || "") ? "text-blue-500" : ""}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-xs">{post.dislikes?.length || 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                      className="gap-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments Section */}
                {showComments === post.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-xs">{comment.username}</p>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.timestamp)}</span>
                          </div>
                          <p className="text-xs">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profilePhoto || undefined} />
                        <AvatarFallback className="text-xs">{username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="text-sm"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleComment(post.id)
                            }
                          }}
                        />
                        <Button size="sm" onClick={() => handleComment(post.id)} disabled={!newComment.trim()}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
