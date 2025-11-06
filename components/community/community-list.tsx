"use client"

import type { Community } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"

interface CommunityListProps {
  communities: Community[]
  selectedCommunity: Community | null
  onSelectCommunity: (community: Community) => void
  onJoinCommunity: (communityId: string) => void
  userCommunities: Community[]
  loading: boolean
}

export default function CommunityList({
  communities,
  selectedCommunity,
  onSelectCommunity,
  onJoinCommunity,
  userCommunities,
  loading,
}: CommunityListProps) {
  if (loading) {
    return <div className="text-center py-8">Loading communities...</div>
  }

  if (communities.length === 0) {
    return <div className="text-center py-8">No communities found</div>
  }

  return (
    <div>
      {communities.map((community) => {
        const isMember = userCommunities.some((c) => c.id === community.id)

        return (
          <div
            key={community.id}
            className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
              selectedCommunity?.id === community.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelectCommunity(community)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Users className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{community.name}</h3>
                <span className="text-xs text-muted-foreground">{community.memberCount} members</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{community.description}</p>
            </div>
            {!isMember && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onJoinCommunity(community.id)
                }}
              >
                Join
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
