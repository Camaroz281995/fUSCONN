"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FollowingList() {
  const { username, following, removeFollowing, addFollowing } = useUser()
  const [newFollowing, setNewFollowing] = useState("")
  const [userProfiles, setUserProfiles] = useState<Record<string, { photo: string | null }>>({})

  useEffect(() => {
    // In a real app, we would fetch profile data for each followed user
    // For this demo, we'll simulate it
    const fetchProfiles = async () => {
      const profiles: Record<string, { photo: string | null }> = {}

      for (const user of following) {
        // Simulate API call to get user profile
        profiles[user] = { photo: null }
      }

      setUserProfiles(profiles)
    }

    if (following.length > 0) {
      fetchProfiles()
    }
  }, [following])

  const handleAddFollowing = () => {
    if (!newFollowing.trim() || newFollowing === username) return

    addFollowing(newFollowing.trim())
    setNewFollowing("")
  }

  if (!username) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Set your username to manage following</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-following">Follow a User</Label>
        <div className="flex gap-2">
          <Input
            id="new-following"
            placeholder="Enter username to follow"
            value={newFollowing}
            onChange={(e) => setNewFollowing(e.target.value)}
          />
          <Button onClick={handleAddFollowing}>Follow</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">People You Follow</h3>

        {following.length === 0 ? (
          <div className="text-center py-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">You're not following anyone yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {following.map((user) => (
              <div key={user} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {userProfiles[user]?.photo ? (
                      <AvatarImage src={userProfiles[user].photo || "/placeholder.svg"} alt={user} />
                    ) : (
                      <AvatarFallback>{user.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium">{user}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFollowing(user)}>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
