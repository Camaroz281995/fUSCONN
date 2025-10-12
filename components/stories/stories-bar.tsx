"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import CreateStory from "./create-story"
import StoryViewer from "./story-viewer"
import { Plus } from "lucide-react"
import type { Story } from "@/lib/types"

const SAMPLE_STORIES: Story[] = [
  {
    id: "1",
    username: "alice_wonder",
    content: "Beautiful sunset today! 🌅",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Sunset+Story",
    timestamp: Date.now() - 3600000,
    expiresAt: Date.now() + 82800000, // 23 hours from now
    viewers: ["user1", "user2"],
  },
  {
    id: "2",
    username: "bob_builder",
    content: "Working on a new project",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Project+Story",
    timestamp: Date.now() - 7200000,
    expiresAt: Date.now() + 79200000, // 22 hours from now
    viewers: ["user3"],
  },
  {
    id: "3",
    username: "charlie_chef",
    content: "Cooking something delicious!",
    videoUrl: "/placeholder.mp4",
    timestamp: Date.now() - 1800000,
    expiresAt: Date.now() + 84600000, // 23.5 hours from now
    viewers: [],
  },
]

export default function StoriesBar() {
  const { username } = useUser()
  const [stories] = useState<Story[]>(SAMPLE_STORIES)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  // Filter out expired stories
  const activeStories = stories.filter((story) => story.expiresAt > Date.now())

  // Group stories by user
  const storiesByUser = activeStories.reduce(
    (acc, story) => {
      if (!acc[story.username]) {
        acc[story.username] = []
      }
      acc[story.username].push(story)
      return acc
    },
    {} as Record<string, Story[]>,
  )

  const userStoryGroups = Object.entries(storiesByUser)

  if (showCreateStory) {
    return <CreateStory onClose={() => setShowCreateStory(false)} />
  }

  if (selectedStory) {
    return (
      <StoryViewer
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onNext={() => {
          // Find next story logic here
          setSelectedStory(null)
        }}
        onPrevious={() => {
          // Find previous story logic here
          setSelectedStory(null)
        }}
      />
    )
  }

  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="flex space-x-3 p-2">
          {/* Add Story Button */}
          {username && (
            <div className="flex-shrink-0 text-center">
              <Button
                variant="outline"
                className="h-16 w-16 rounded-full p-0 border-2 border-dashed bg-transparent"
                onClick={() => setShowCreateStory(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
              <p className="text-xs mt-1 text-muted-foreground">Your Story</p>
            </div>
          )}

          {/* Stories */}
          {userStoryGroups.map(([user, userStories]) => {
            const hasUnviewedStories = userStories.some((story) => !story.viewers.includes(username || ""))

            return (
              <div key={user} className="flex-shrink-0 text-center">
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="h-16 w-16 rounded-full p-0"
                    onClick={() => setSelectedStory(userStories[0])}
                  >
                    <Avatar
                      className={`h-14 w-14 ${hasUnviewedStories ? "ring-2 ring-primary ring-offset-2" : "ring-2 ring-gray-300"}`}
                    >
                      <AvatarFallback>{user.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                  {userStories.length > 1 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{userStories.length}</Badge>
                  )}
                </div>
                <p className="text-xs mt-1 text-muted-foreground truncate w-16">{user}</p>
              </div>
            )
          })}

          {/* No Stories Message */}
          {userStoryGroups.length === 0 && !username && (
            <div className="flex-1 text-center py-4">
              <p className="text-sm text-muted-foreground">Sign in to view and create stories</p>
            </div>
          )}

          {userStoryGroups.length === 0 && username && (
            <div className="flex-1 text-center py-4">
              <p className="text-sm text-muted-foreground">No stories available. Be the first to share one!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
