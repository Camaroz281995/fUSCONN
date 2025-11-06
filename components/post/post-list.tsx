"use client"

import type { Post } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import CommentForm from "@/components/post/comment-form"
import CommentList from "@/components/post/comment-list"
import VideoPlayer from "@/components/video/video-player"
import { formatDate } from "@/lib/utils"
import { useUser } from "@/context/user-context"
import { ThumbsUp, ThumbsDown, MessageCircle, UserPlus, UserMinus } from "lucide-react"
import { useState } from "react"

interface PostListProps {
  posts: Post[]
  onCommentAdded: () => void
  onPostUpdated?: () => void
}

export default function PostList({ posts = [], onCommentAdded, onPostUpdated }: PostListProps) {
  const { username, isFollowing, addFollowing, removeFollowing } = useUser()
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

  if (!posts || posts.length === 0) {
    return <div className="text-center py-8">No posts yet. Be the first to post!</div>
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleLike = async (postId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (response.ok && onPostUpdated) {
        onPostUpdated()
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleDislike = async (postId: string) => {
    if (!username) return

    try {
      const response = await fetch(`/api/posts/${postId}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (response.ok && onPostUpdated) {
        onPostUpdated()
      }
    } catch (error) {
      console.error("Error disliking post:", error)
    }
  }

  const handleFollowUser = (postUsername: string) => {
    if (username && postUsername !== username) {
      addFollowing(postUsername)
    }
  }

  const handleUnfollowUser = (postUsername: string) => {
    if (username) {
      removeFollowing(postUsername)
    }
  }

  // Function to render content with @mentions highlighted
  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.substring(1)
        return (
          <span key={index} className="text-primary font-semibold hover:underline cursor-pointer">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isLiked = post.likes?.includes(username) || false
        const isDisliked = post.dislikes?.includes(username) || false
        const showComments = expandedComments[post.id] || false
        const isFollowingAuthor = isFollowing(post.username)
        const isSelf = post.username === username

        return (
          <Card key={post.id} className="card-transparent overflow-hidden">
            <CardHeader className="bg-muted/30 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{post.username}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
                  </div>
                </div>

                {username && !isSelf && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      isFollowingAuthor ? handleUnfollowUser(post.username) : handleFollowUser(post.username)
                    }
                  >
                    {isFollowingAuthor ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-2">
              {post.type === "video" && post.videoUrl && (
                <div className="mb-4">
                  <VideoPlayer url={post.videoUrl} />
                </div>
              )}

              {post.type === "photo" && post.photoUrl && (
                <div className="mb-4">
                  <div className="aspect-square max-h-96 bg-black rounded-md overflow-hidden">
                    <img
                      src={post.photoUrl || "/placeholder.svg"}
                      alt="Post"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {post.type === "gif" && post.gifUrl && (
                <div className="mb-4">
                  <div className="aspect-square max-h-96 bg-black rounded-md overflow-hidden">
                    <img src={post.gifUrl || "/placeholder.svg"} alt="GIF" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <p className="whitespace-pre-wrap">{renderContentWithMentions(post.content)}</p>
            </CardContent>

            <CardFooter className="flex flex-col items-stretch p-0">
              <div className="p-2 border-t flex items-center">
                <Button
                  variant={isLiked ? "default" : "ghost"}
                  size="sm"
                  className="gap-1"
                  onClick={() => handleLike(post.id)}
                  disabled={!username}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes?.length || 0}</span>
                </Button>

                <Button
                  variant={isDisliked ? "default" : "ghost"}
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDislike(post.id)}
                  disabled={!username}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{post.dislikes?.length || 0}</span>
                </Button>

                <Button variant="ghost" size="sm" className="gap-1 ml-auto" onClick={() => toggleComments(post.id)}>
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments?.length || 0}</span>
                </Button>
              </div>

              {showComments && (
                <>
                  <div className="border-t p-4">
                    <CommentList comments={post.comments || []} />
                  </div>

                  <div className="border-t p-4">
                    <CommentForm postId={post.id} onCommentAdded={onCommentAdded} />
                  </div>
                </>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
