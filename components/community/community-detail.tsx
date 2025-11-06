"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CardContent, CardHeader, CardTitle, CardDescription, Card } from "@/components/ui/card"
import { Users, Send, ArrowUp, ArrowDown, MessageSquare } from "lucide-react"
import type { Community, CommunityPost } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface CommunityDetailProps {
  community: Community
  isMember: boolean
  onJoin: () => void
  onRefresh: () => void
}

export default function CommunityDetail({ community, isMember, onJoin, onRefresh }: CommunityDetailProps) {
  const { username } = useUser()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [postContent, setPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/communities/${community.id}/posts`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (community) fetchPosts()
  }, [community])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !postContent.trim() || !isMember) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/communities/${community.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, content: postContent }),
      })

      if (!res.ok) throw new Error("Failed to create post")
      setPostContent("")
      fetchPosts()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!username) return
    try {
      await fetch("/api/communities/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, username, voteType }),
      })
      fetchPosts()
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="px-4 py-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                <Users className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{community.name}</CardTitle>
              <CardDescription>{community.description}</CardDescription>
            </div>
          </div>
          {!isMember && <Button onClick={onJoin}>Join Community</Button>}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs defaultValue="posts" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="members">Members ({community.memberCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="flex-1 flex flex-col m-0">
            {isMember && (
              <div className="p-4 border-b">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Write something to the community..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting || !postContent.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}

            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No posts yet. Be the first to post!</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => {
                    const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0)
                    const hasUpvoted = username && post.upvotes?.includes(username)
                    const hasDownvoted = username && post.downvotes?.includes(username)

                    return (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 ${hasUpvoted ? "text-orange-500" : ""}`}
                                onClick={() => handleVote(post.id, "up")}
                                disabled={!username}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <span
                                className={`text-sm font-medium ${score > 0 ? "text-orange-500" : score < 0 ? "text-blue-500" : ""}`}
                              >
                                {score}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 ${hasDownvoted ? "text-blue-500" : ""}`}
                                onClick={() => handleVote(post.id, "down")}
                                disabled={!username}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{post.username}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Button variant="ghost" size="sm" className="h-8 text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {post.commentCount || 0} Comments
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="members" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {community.members?.map((member) => (
                  <div key={member} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{member}</span>
                    {member === community.creator && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Creator</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  )
}
