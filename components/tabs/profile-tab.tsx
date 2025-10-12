"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Camera, Settings, Users, MessageCircle, Heart } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"

export default function ProfileTab() {
  const { username, profilePhoto, setProfilePhoto } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    pets: 0,
  })

  useEffect(() => {
    if (username) {
      loadProfile()
      loadStats()
    }
  }, [username])

  const loadProfile = () => {
    if (!username) return

    const profile = persistentStorage.getUserProfile(username)
    if (profile) {
      setBio(profile.bio || "")
      setDisplayName(profile.displayName || username)
    }
  }

  const loadStats = () => {
    if (!username) return

    const posts = persistentStorage.getPosts().filter((p) => p.username === username)
    const followers = persistentStorage.getFollowers(username)
    const following = persistentStorage.getFollowing(username)
    const pets = persistentStorage.getUserPets(username)

    setStats({
      posts: posts.length,
      followers: followers.length,
      following: following.length,
      pets: pets.length,
    })
  }

  const handleSaveProfile = () => {
    if (!username) return

    persistentStorage.updateUserProfile(username, {
      bio: bio.trim(),
      displayName: displayName.trim() || username,
    })

    setIsEditing(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        setProfilePhoto(photoUrl)
        if (username) {
          persistentStorage.setProfilePhoto(username, photoUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to view profile</h3>
          <p className="text-muted-foreground">Connect to the P2P network</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer border">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <Input
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <h2 className="text-xl font-bold mb-1">{displayName || username}</h2>
                <p className="text-muted-foreground text-sm mb-2">@{username}</p>
                {bio && <p className="text-sm mb-4">{bio}</p>}
                <Badge variant="secondary" className="mb-4">
                  P2P Network Member
                </Badge>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.posts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pets}</p>
              <p className="text-xs text-muted-foreground">Pets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Users className="h-4 w-4 mr-3" />
            Manage Connections
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <MessageCircle className="h-4 w-4 mr-3" />
            Message History
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Heart className="h-4 w-4 mr-3" />
            Virtual Pets
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Settings className="h-4 w-4 mr-3" />
            P2P Settings
          </Button>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">P2P Connection</span>
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Peers Connected</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Synced</span>
              <span className="text-sm font-medium">2.3 MB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
