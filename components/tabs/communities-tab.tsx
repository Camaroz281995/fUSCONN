"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, Lock, Globe, UserPlus, MessageCircle } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import type { Community } from "@/lib/types"

export default function CommunitiesTab() {
  const { username } = useUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = () => {
    const allCommunities = persistentStorage.getCommunities()
    setCommunities(allCommunities)
  }

  const handleJoinCommunity = (communityId: string) => {
    if (!username) return

    const allCommunities = persistentStorage.getCommunities()
    const community = allCommunities.find((c) => c.id === communityId)

    if (community && !community.members.includes(username)) {
      community.members.push(username)
      persistentStorage.saveCommunities(allCommunities)
      loadCommunities()
    }
  }

  const handleLeaveCommunity = (communityId: string) => {
    if (!username) return

    const allCommunities = persistentStorage.getCommunities()
    const community = allCommunities.find((c) => c.id === communityId)

    if (community && community.members.includes(username)) {
      community.members = community.members.filter((member) => member !== username)
      persistentStorage.saveCommunities(allCommunities)
      loadCommunities()
    }
  }

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const userCommunities = filteredCommunities.filter((c) => c.members.includes(username || ""))
  const availableCommunities = filteredCommunities.filter((c) => !c.members.includes(username || "") && !c.isPrivate)

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* My Communities */}
      {userCommunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userCommunities.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{community.name}</h3>
                        {community.isPrivate ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Globe className="h-3 w-3 text-muted-foreground" />
                        )}
                        {community.owner === username && (
                          <Badge variant="secondary" className="text-xs">
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{community.members.length} members</p>
                      {community.description && (
                        <p className="text-xs text-muted-foreground mt-1">{community.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    {community.owner !== username && (
                      <Button variant="outline" size="sm" onClick={() => handleLeaveCommunity(community.id)}>
                        Leave
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Communities */}
      {availableCommunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Discover Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableCommunities.map((community) => (
                <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{community.name}</h3>
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{community.members.length} members</p>
                      {community.description && (
                        <p className="text-xs text-muted-foreground mt-1">{community.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">by @{community.owner}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleJoinCommunity(community.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredCommunities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No communities found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try a different search term" : "No public communities are available yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
