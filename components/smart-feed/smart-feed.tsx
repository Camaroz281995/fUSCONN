"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, TrendingUp, Users, Clock, Search } from "lucide-react"
import PostList from "@/components/post/post-list"
import type { Post } from "@/lib/types"
import { persistentStorage } from "@/lib/persistent-storage"
import StoriesBar from "@/components/stories/stories-bar"

export default function SmartFeed() {
  const { username, following } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("for-you")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPosts = async () => {
    try {
      setLoading(true)

      // Get posts from persistent storage
      const allPosts = persistentStorage.getPosts()

      // Sort posts by timestamp (newest first) to ensure new posts appear at the top
      const sortedPosts = allPosts.sort((a, b) => b.timestamp - a.timestamp)

      setPosts(sortedPosts)

      // Apply initial filtering based on active tab
      filterPosts(sortedPosts, activeTab)
    } catch (error) {
      console.error("Error fetching posts for smart feed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    // Listen for new posts being created
    const handleNewPost = () => {
      fetchPosts()
    }

    window.addEventListener("newPostCreated", handleNewPost)

    // Refresh posts every 30 seconds
    const interval = setInterval(fetchPosts, 30000)

    return () => {
      window.removeEventListener("newPostCreated", handleNewPost)
      clearInterval(interval)
    }
  }, [username, following])

  useEffect(() => {
    filterPosts(posts, activeTab)
  }, [activeTab, posts, following, searchQuery])

  const filterPosts = (allPosts: Post[], tab: string) => {
    let filtered = [...allPosts]

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) => post.content.toLowerCase().includes(query) || post.username.toLowerCase().includes(query),
      )
    }

    // Apply tab-specific filtering
    switch (tab) {
      case "for-you":
        // Show all posts, prioritize posts from followed users
        filtered = filtered.sort((a, b) => {
          const aScore = calculateRelevanceScore(a)
          const bScore = calculateRelevanceScore(b)
          return bScore - aScore
        })
        break

      case "following":
        // Show posts from users the current user is following, but if none, show all posts
        if (following.length > 0) {
          const followingPosts = filtered.filter((post) => following.includes(post.username))
          filtered = followingPosts.length > 0 ? followingPosts : filtered
        }
        break

      case "trending":
        // Sort by engagement (likes + comments)
        filtered = filtered.sort((a, b) => {
          const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0)
          const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0)
          return bEngagement - aEngagement
        })
        break

      case "recent":
        // Sort by timestamp (newest first)
        filtered = filtered.sort((a, b) => b.timestamp - a.timestamp)
        break
    }

    setFilteredPosts(filtered)
  }

  const calculateRelevanceScore = (post: Post): number => {
    let score = 0

    // Posts from followed users get a boost
    if (following.includes(post.username)) {
      score += 50
    }

    // Recent posts get a boost
    const hoursSincePosted = (Date.now() - post.timestamp) / (1000 * 60 * 60)
    if (hoursSincePosted < 24) {
      score += Math.max(0, 24 - hoursSincePosted)
    }

    // Posts with more engagement get a boost
    score += (post.likes?.length || 0) * 2
    score += (post.comments?.length || 0) * 3

    return score
  }

  const handlePostUpdated = () => {
    fetchPosts()
  }

  return (
    <Card className="card-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Smart Feed
        </CardTitle>
      </CardHeader>
      <div className="px-4 pb-3">
        <StoriesBar />
      </div>
      <CardContent className="p-0">
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 mx-4">
            <TabsTrigger value="for-you">
              <Sparkles className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">For You</span>
              <span className="md:hidden">You</span>
            </TabsTrigger>
            <TabsTrigger value="following">
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Following</span>
              <span className="md:hidden">Follow</span>
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Trending</span>
              <span className="md:hidden">Trend</span>
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Recent</span>
              <span className="md:hidden">New</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="px-4 pb-4">
              {loading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  {activeTab === "following" && following.length === 0 ? (
                    <div>
                      <p className="mb-4">You're not following anyone yet</p>
                      <Button variant="outline" onClick={() => setActiveTab("for-you")}>
                        Discover users to follow
                      </Button>
                    </div>
                  ) : (
                    <p>No posts found</p>
                  )}
                </div>
              ) : (
                <PostList posts={filteredPosts} onCommentAdded={fetchPosts} onPostUpdated={handlePostUpdated} />
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
