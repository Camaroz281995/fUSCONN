"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Search, ArrowUp, ArrowDown, MessageCircle, AlertCircle } from "lucide-react"

interface Community {
  id: string
  name: string
  description: string
  creator: string
  members: string[]
  memberCount: number
  category: string
  createdAt: number
}

interface CommunityPost {
  id: string
  communityId: string
  author: string
  title: string
  content: string
  upvotes: string[]
  downvotes: string[]
  comments: number
  timestamp: number
}

interface CommunitiesTabProps {
  username: string
}

export default function CommunitiesTab({ username }: CommunitiesTabProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState("")
  const [newCommunityDescription, setNewCommunityDescription] = useState("")
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")

  useEffect(() => {
    loadCommunities()
  }, [])

  useEffect(() => {
    if (selectedCommunity) {
      loadCommunityPosts(selectedCommunity.id)
    }
  }, [selectedCommunity])

  const loadCommunities = () => {
    try {
      const stored = localStorage.getItem("fusconn-global-communities")
      if (stored) {
        setCommunities(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading communities:", error)
    }
  }

  const loadCommunityPosts = (communityId: string) => {
    try {
      const stored = localStorage.getItem(`fusconn-community-posts-${communityId}`)
      if (stored) {
        setCommunityPosts(JSON.parse(stored))
      } else {
        setCommunityPosts([])
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      setCommunityPosts([])
    }
  }

  const saveCommunities = (updatedCommunities: Community[]) => {
    localStorage.setItem("fusconn-global-communities", JSON.stringify(updatedCommunities))
    setCommunities(updatedCommunities)
  }

  const saveCommunityPosts = (communityId: string, posts: CommunityPost[]) => {
    localStorage.setItem(`fusconn-community-posts-${communityId}`, JSON.stringify(posts))
    setCommunityPosts(posts)
  }

  const handleCreateCommunity = () => {
    if (!username) {
      alert("Please sign in to create communities")
      return
    }

    if (!newCommunityName.trim()) {
      alert("Please enter a community name")
      return
    }

    const newCommunity: Community = {
      id: `community-${Date.now()}`,
      name: newCommunityName.trim(),
      description: newCommunityDescription.trim(),
      creator: username,
      members: [username],
      memberCount: 1,
      category: "general",
      createdAt: Date.now(),
    }

    const updatedCommunities = [newCommunity, ...communities]
    saveCommunities(updatedCommunities)
    setNewCommunityName("")
    setNewCommunityDescription("")
    setShowCreateDialog(false)
  }

  const handleJoinCommunity = (community: Community) => {
    if (!username) {
      alert("Please sign in to join communities")
      return
    }

    const updatedCommunities = communities.map((c) => {
      if (c.id === community.id) {
        if (c.members.includes(username)) {
          return {
            ...c,
            members: c.members.filter((m) => m !== username),
            memberCount: c.memberCount - 1,
          }
        } else {
          return {
            ...c,
            members: [...c.members, username],
            memberCount: c.memberCount + 1,
          }
        }
      }
      return c
    })

    saveCommunities(updatedCommunities)

    if (selectedCommunity?.id === community.id) {
      const updated = updatedCommunities.find((c) => c.id === community.id)
      if (updated) setSelectedCommunity(updated)
    }
  }

  const handleCreatePost = () => {
    if (!username || !selectedCommunity) {
      alert("Please sign in to create posts")
      return
    }

    if (!postTitle.trim()) {
      alert("Please enter a post title")
      return
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      communityId: selectedCommunity.id,
      author: username,
      title: postTitle.trim(),
      content: postContent.trim(),
      upvotes: [],
      downvotes: [],
      comments: 0,
      timestamp: Date.now(),
    }

    const updatedPosts = [newPost, ...communityPosts]
    saveCommunityPosts(selectedCommunity.id, updatedPosts)
    setPostTitle("")
    setPostContent("")
    setShowPostDialog(false)
  }

  const handleVote = (postId: string, voteType: "up" | "down") => {
    if (!username || !selectedCommunity) {
      alert("Please sign in to vote")
      return
    }

    const updatedPosts = communityPosts.map((post) => {
      if (post.id === postId) {
        const newPost = { ...post }
        if (voteType === "up") {
          if (newPost.upvotes.includes(username)) {
            newPost.upvotes = newPost.upvotes.filter((u) => u !== username)
          } else {
            newPost.upvotes = [...newPost.upvotes, username]
            newPost.downvotes = newPost.downvotes.filter((u) => u !== username)
          }
        } else {
          if (newPost.downvotes.includes(username)) {
            newPost.downvotes = newPost.downvotes.filter((u) => u !== username)
          } else {
            newPost.downvotes = [...newPost.downvotes, username]
            newPost.upvotes = newPost.upvotes.filter((u) => u !== username)
          }
        }
        return newPost
      }
      return post
    })

    saveCommunityPosts(selectedCommunity.id, updatedPosts)
  }

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedCommunity) {
    const isMember = selectedCommunity.members.includes(username || "")

    return (
      <div className="space-y-4">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    {selectedCommunity.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedCommunity.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedCommunity.memberCount} members
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {username && isMember && (
                  <Button onClick={() => setShowPostDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Post
                  </Button>
                )}
                <Button onClick={() => setSelectedCommunity(null)} variant="outline" size="sm">
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {username && (
              <Button onClick={() => handleJoinCommunity(selectedCommunity)} variant={isMember ? "outline" : "default"}>
                {isMember ? "Leave Community" : "Join Community"}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {communityPosts.length === 0 ? (
            <Card className="bg-white shadow-md">
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to post in this community!</p>
                {username && isMember && <Button onClick={() => setShowPostDialog(true)}>Create Post</Button>}
              </CardContent>
            </Card>
          ) : (
            communityPosts.map((post) => (
              <Card key={post.id} className="bg-white shadow-md">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleVote(post.id, "up")}
                      >
                        <ArrowUp
                          className={`h-4 w-4 ${username && post.upvotes.includes(username) ? "fill-orange-500 text-orange-500" : ""}`}
                        />
                      </Button>
                      <span className="text-sm font-medium">{post.upvotes.length - post.downvotes.length}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleVote(post.id, "down")}
                      >
                        <ArrowDown
                          className={`h-4 w-4 ${username && post.downvotes.includes(username) ? "fill-blue-500 text-blue-500" : ""}`}
                        />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>{Math.floor((Date.now() - post.timestamp) / 3600000)}h ago</span>
                      </div>
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      {post.content && <p className="text-sm text-muted-foreground mb-2">{post.content}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-8">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.comments} Comments
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Post in {selectedCommunity.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="Post title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">Content (optional)</Label>
                <Textarea
                  id="post-content"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <Button onClick={handleCreatePost} disabled={!postTitle.trim()}>
              Post
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Communities
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Community</DialogTitle>
                </DialogHeader>
                {!username ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Please sign in to create communities</p>
                    <Button onClick={() => setShowCreateDialog(false)}>Close</Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="community-name">Community Name</Label>
                      <Input
                        id="community-name"
                        placeholder="e.g., Music Lovers"
                        value={newCommunityName}
                        onChange={(e) => setNewCommunityName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="community-description">Description</Label>
                      <Textarea
                        id="community-description"
                        placeholder="What is your community about?"
                        value={newCommunityDescription}
                        onChange={(e) => setNewCommunityDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateCommunity} disabled={!newCommunityName.trim()}>
                      Create
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
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredCommunities.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No communities yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to create a community!</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Community</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCommunity(community)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {community.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{community.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{community.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {community.memberCount} members
                      </Badge>
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
