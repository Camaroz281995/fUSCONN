"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { persistentStorage } from "@/lib/persistent-storage"
import { formatDate, generateId } from "@/lib/utils"
import { Heart, MessageCircle, Share, Send, MoreHorizontal } from "lucide-react"
import type { Post, Comment } from "@/lib/types"

interface PostListProps {
  posts: Post[]
  onCommentAdded?: () => void
  onPostUpdated?: () => void
}

export default function PostList({ posts, onCommentAdded, onPostUpdated }: PostListProps) {
  const { username } = useUser()
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [newComments, setNewComments] = useState<Record<string, string>>({})

  const handleLike = (postId: string) => {
    if (!username) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const likes = post.likes || []
    const isLiked = likes.includes(username)

    const updatedLikes = isLiked ? likes.filter((u) => u !== username) : [...likes, username]

    persistentStorage.updatePost(postId, { likes: updatedLikes })
    onPostUpdated?.()
  }

  const handleComment = (postId: string) => {
    const commentText = newComments[postId]?.trim()
    if (!username || !commentText) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newComment: Comment = {
      id: generateId(),
      username,
      content: commentText,
      timestamp: Date.now(),
      likes: [],
    }

    const updatedComments = [...(post.comments || []), newComment]
    persistentStorage.updatePost(postId, { comments: updatedComments })

    setNewComments((prev) => ({ ...prev, [postId]: "" }))
    onCommentAdded?.()
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleCommentLike = (postId: string, commentId: string) => {
    if (!username) return

    const post = posts.find((p) => p.id === postId)
    if (!post || !post.comments) return

    const updatedComments = post.comments.map((comment) => {
      if (comment.id === commentId) {
        const likes = comment.likes || []
        const isLiked = likes.includes(username)
        return {
          ...comment,
          likes: isLiked ? likes.filter((u) => u !== username) : [...likes, username],
        }
      }
      return comment
    })

    persistentStorage.updatePost(postId, { comments: updatedComments })
    onPostUpdated?.()
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-medium mb-2">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isLiked = post.likes?.includes(username || "") || false
        const likesCount = post.likes?.length || 0
        const commentsCount = post.comments?.length || 0
        const isCommentsExpanded = expandedComments.has(post.id)

        return (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.username}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(post.timestamp)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Post Content */}
              {post.content && (
                <div className="text-sm leading-relaxed">
                  {post.content.split("\n").map((line, index) => (
                    <p key={index} className={index > 0 ? "mt-2" : ""}>
                      {line.split(" ").map((word, wordIndex) => {
                        if (word.startsWith("@")) {
                          return (
                            <Badge key={wordIndex} variant="secondary" className="mx-1">
                              {word}
                            </Badge>
                          )
                        }
                        if (word.startsWith("#")) {
                          return (
                            <Badge key={wordIndex} variant="outline" className="mx-1">
                              {word}
                            </Badge>
                          )
                        }
                        return word + " "
                      })}
                    </p>
                  ))}
                </div>
              )}

              {/* Media Content */}
              {post.imageUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={post.imageUrl || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full max-h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Image+Error"
                    }}
                  />
                </div>
              )}

              {post.gifUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={post.gifUrl || "/placeholder.svg"}
                    alt="Post GIF"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              {post.videoUrl && (
                <div className="rounded-lg overflow-hidden">
                  <video src={post.videoUrl} controls className="w-full max-h-96 object-cover">
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                    {likesCount > 0 && <span>{likesCount}</span>}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {commentsCount > 0 && <span>{commentsCount}</span>}
                  </Button>

                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {isCommentsExpanded && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    {/* Add Comment */}
                    {username && (
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={newComments[post.id] || ""}
                            onChange={(e) =>
                              setNewComments((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            className="min-h-[60px] resize-none"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!newComments[post.id]?.trim()}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map((comment) => {
                          const isCommentLiked = comment.likes?.includes(username || "") || false
                          const commentLikesCount = comment.likes?.length || 0

                          return (
                            <div key={comment.id} className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{comment.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{comment.username}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</p>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCommentLike(post.id, comment.id)}
                                    className={`h-6 px-2 ${isCommentLiked ? "text-red-500" : ""}`}
                                  >
                                    <Heart className={`h-3 w-3 mr-1 ${isCommentLiked ? "fill-current" : ""}`} />
                                    {commentLikesCount > 0 && <span className="text-xs">{commentLikesCount}</span>}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
