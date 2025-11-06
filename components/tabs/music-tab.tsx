"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/context/user-context"
import { Users, Plus, TrendingUp, MessageSquare, ArrowUp, ArrowDown, Search, Globe, Lock } from "lucide-react"

interface Community {
  id: string
  name: string
  description: string
  creator: string
  members: string[]
  memberCount: number
  isPrivate: boolean
  category: string
  createdAt: number
  icon?: string
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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function MusicTab() {
  const { username } = useUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Create community form
  const [newCommunityName, setNewCommunityName] = useState("")
  const [newCommunityDescription, setNewCommunityDescription] = useState("")
  const [newCommunityCategory, setNewCommunityCategory] = useState("general")
  const [isPrivate, setIsPrivate] = useState(false)

  // Create post form
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

  const loadCommunities = async () => {
    try {
      const response = await fetch("/api/communities")
      const data = await response.json()
      setCommunities(data.communities || [])
    } catch (error) {
      console.error("Error loading communities:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem("communities")
      if (stored) {
        setCommunities(JSON.parse(stored))
      }
    }
  }

  const loadCommunityPosts = async (communityId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`)
      const data = await response.json()
      setCommunityPosts(data.posts || [])
    } catch (error) {
      console.error("Error loading posts:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem(`community-posts-${communityId}`)
      if (stored) {
        setCommunityPosts(JSON.parse(stored))
      } else {
        setCommunityPosts([])
      }
    }
  }

  const handleCreateCommunity = async () => {
    if (!username || !newCommunityName.trim()) return

    const newCommunity: Community = {
      id: generateId(),
      name: newCommunityName.trim(),
      description: newCommunityDescription.trim(),
      creator: username,
      members: [username],
      memberCount: 1,
      isPrivate,
      category: newCommunityCategory,
      createdAt: Date.now(),
    }

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommunity),
      })

      if (response.ok) {
        await loadCommunities()
        setShowCreateDialog(false)
        resetCreateForm()
      }
    } catch (error) {
      console.error("Error creating community:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem("communities")
      const existing = stored ? JSON.parse(stored) : []
      const updated = [...existing, newCommunity]
      localStorage.setItem("communities", JSON.stringify(updated))
      setCommunities(updated)
      setShowCreateDialog(false)
      resetCreateForm()
    }
  }

  const handleCreatePost = async () => {
    if (!username || !selectedCommunity || !postTitle.trim()) return

    const newPost: CommunityPost = {
      id: generateId(),
      communityId: selectedCommunity.id,
      author: username,
      title: postTitle.trim(),
      content: postContent.trim(),
      upvotes: [],
      downvotes: [],
      comments: 0,
      timestamp: Date.now(),
    }

    try {
      const response = await fetch("/api/communities/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      })

      if (response.ok) {
        await loadCommunityPosts(selectedCommunity.id)
        setShowPostDialog(false)
        resetPostForm()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      // Fallback to localStorage
      const key = `community-posts-${selectedCommunity.id}`
      const stored = localStorage.getItem(key)
      const existing = stored ? JSON.parse(stored) : []
      const updated = [newPost, ...existing]
      localStorage.setItem(key, JSON.stringify(updated))
      setCommunityPosts(updated)
      setShowPostDialog(false)
      resetPostForm()
    }
  }

  const handleJoinCommunity = async (community: Community) => {
    if (!username) return

    try {
      const response = await fetch(`/api/communities/${community.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        await loadCommunities()
      }
    } catch (error) {
      console.error("Error joining community:", error)
      // Fallback to localStorage
      const stored = localStorage.getItem("communities")
      const existing = stored ? JSON.parse(stored) : []
      const updated = existing.map((c: Community) =>
        c.id === community.id ? { ...c, members: [...c.members, username], memberCount: c.memberCount + 1 } : c,
      )
      localStorage.setItem("communities", JSON.stringify(updated))
      setCommunities(updated)
    }
  }

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!username || !selectedCommunity) return

    try {
      const response = await fetch("/api/communities/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, username, voteType }),
      })

      if (response.ok) {
        await loadCommunityPosts(selectedCommunity.id)
      }
    } catch (error) {
      console.error("Error voting:", error)
      // Fallback to localStorage
      const key = `community-posts-${selectedCommunity.id}`
      const stored = localStorage.getItem(key)
      const existing = stored ? JSON.parse(stored) : []
      const updated = existing.map((post: CommunityPost) => {
        if (post.id !== postId) return post

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
      })
      localStorage.setItem(key, JSON.stringify(updated))
      setCommunityPosts(updated)
    }
  }

  const resetCreateForm = () => {
    setNewCommunityName("")
    setNewCommunityDescription("")
    setNewCommunityCategory("general")
    setIsPrivate(false)
  }

  const resetPostForm = () => {
    setPostTitle("")
    setPostContent("")
  }

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const userCommunities = filteredCommunities.filter((c) => c.members.includes(username || ""))
  const trendingCommunities = filteredCommunities
    .filter((c) => !c.members.includes(username || ""))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5)

  const getVoteCount = (post: CommunityPost) => post.upvotes.length - post.downvotes.length

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to join communities</h3>
          <p className="text-muted-foreground">Create and participate in topic-based communities</p>
        </CardContent>
      </Card>
    )
  }

  if (selectedCommunity) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    {selectedCommunity.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedCommunity.name}
                    {selectedCommunity.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription>{selectedCommunity.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedCommunity.memberCount} members
                    </span>
                    <Badge variant="secondary">{selectedCommunity.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowPostDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Post
                </Button>
                <Button onClick={() => setSelectedCommunity(null)} variant="outline" size="sm">
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-3">
          {communityPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to post in this community!</p>
                <Button onClick={() => setShowPostDialog(true)}>Create Post</Button>
              </CardContent>
            </Card>
          ) : (
            communityPosts.map((post) => (
              <Card key={post.id}>
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
                          className={`h-4 w-4 ${post.upvotes.includes(username) ? "fill-orange-500 text-orange-500" : ""}`}
                        />
                      </Button>
                      <span className="text-sm font-medium">{getVoteCount(post)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleVote(post.id, "down")}
                      >
                        <ArrowDown
                          className={`h-4 w-4 ${post.downvotes.includes(username) ? "fill-blue-500 text-blue-500" : ""}`}
                        />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      {post.content && <p className="text-sm text-muted-foreground mb-2">{post.content}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-8">
                          <MessageSquare className="h-3 w-3 mr-1" />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPostDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={!postTitle.trim()}>
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Communities
            </div>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Community
            </Button>
          </CardTitle>
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

      <Tabs defaultValue="my-communities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-communities" className="space-y-3">
          {userCommunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No communities yet</h3>
                <p className="text-muted-foreground mb-4">Join or create a community to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>Create Community</Button>
              </CardContent>
            </Card>
          ) : (
            userCommunities.map((community) => (
              <Card key={community.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={() => setSelectedCommunity(community)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{community.name}</h3>
                        {community.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {community.creator === username && (
                          <Badge variant="secondary" className="text-xs">
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{community.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{community.memberCount} members</span>
                        <Badge variant="outline" className="text-xs">
                          {community.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Communities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingCommunities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No communities to discover yet</p>
              ) : (
                trendingCommunities.map((community) => (
                  <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{community.name}</h3>
                          {community.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{community.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{community.memberCount} members</span>
                          <Badge variant="outline" className="text-xs">
                            {community.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleJoinCommunity(community)} size="sm">
                      Join
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Community</DialogTitle>
          </DialogHeader>
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
            <div className="space-y-2">
              <Label htmlFor="community-category">Category</Label>
              <select
                id="community-category"
                value={newCommunityCategory}
                onChange={(e) => setNewCommunityCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="music">Music</option>
                <option value="gaming">Gaming</option>
                <option value="technology">Technology</option>
                <option value="art">Art & Design</option>
                <option value="sports">Sports</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="private-community" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="private-community">Private Community</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCommunity} disabled={!newCommunityName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
