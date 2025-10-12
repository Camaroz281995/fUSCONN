"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { persistentStorage } from "@/lib/persistent-storage"
import type { User } from "@/lib/types"
import { Users, Search, UserPlus, UserMinus } from "lucide-react"

export default function FriendLists() {
  const { username, following, followUser, unfollowUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const allUsers = persistentStorage.getUsers()
    setUsers(allUsers.filter((user) => user.username !== username))
  }

  const getFilteredUsers = () => {
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getFollowingUsers = () => {
    return users.filter((user) => following.includes(user.username))
  }

  const getSuggestedUsers = () => {
    return users.filter((user) => !following.includes(user.username))
  }

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to connect with friends</h3>
          <p className="text-muted-foreground">Discover and follow other users</p>
        </CardContent>
      </Card>
    )
  }

  const filteredUsers = getFilteredUsers()
  const followingUsers = getFollowingUsers()
  const suggestedUsers = getSuggestedUsers()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Friends & Following
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="following" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            {followingUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You're not following anyone yet</p>
                <p className="text-sm text-muted-foreground mt-2">Discover users in the other tabs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persistentStorage.getProfilePhoto(user.username) || undefined} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">@{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unfollowUser(user.username)}>
                      <UserMinus className="h-4 w-4 mr-1" />
                      Unfollow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {suggestedUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No new users to discover</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedUsers.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persistentStorage.getProfilePhoto(user.username) || undefined} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">@{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="text-xs">
                          Joined {new Date(user.joinDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => followUser(user.username)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={persistentStorage.getProfilePhoto(user.username) || undefined} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">@{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {following.includes(user.username) ? (
                        <Button variant="outline" size="sm" onClick={() => unfollowUser(user.username)}>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Unfollow
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => followUser(user.username)}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
