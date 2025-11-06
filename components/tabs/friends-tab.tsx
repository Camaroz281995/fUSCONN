"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Users, Check, X, MessageSquare, Video } from "lucide-react"
import { persistentStorage } from "@/lib/persistent-storage"
import type { FriendRequest } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface Friend {
  username: string
  status: "online" | "offline"
  mood?: string
}

export default function FriendsTab() {
  const { username, following, addFollowing, removeFollowing } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])

  useEffect(() => {
    if (username) {
      loadFriendRequests()
      loadFriends()
    }
  }, [username])

  const loadFriendRequests = () => {
    if (!username) return
    const requests = persistentStorage.getFriendRequests(username)
    setFriendRequests(requests.filter((req) => req.status === "pending"))
  }

  const loadFriends = () => {
    if (!username) return
    const profile = persistentStorage.getUserProfile(username)
    if (profile && profile.friends) {
      // Convert friends list to Friend objects with online/offline status
      const friendsList = profile.friends.map((friendName) => ({
        username: friendName,
        // Random status for demo purposes - in production would check actual online status
        status: Math.random() > 0.5 ? "online" : ("offline" as "online" | "offline"),
      }))
      setFriends(friendsList)
    } else {
      setFriends([])
    }
  }

  const acceptFriendRequest = (requestId: string) => {
    persistentStorage.updateFriendRequestStatus(requestId, "accepted")
    loadFriendRequests()
    loadFriends()
  }

  const declineFriendRequest = (requestId: string) => {
    persistentStorage.updateFriendRequestStatus(requestId, "rejected")
    loadFriendRequests()
  }

  const sendFriendRequest = (toUsername: string) => {
    if (!username) return

    const newRequest: FriendRequest = {
      id: uuidv4(),
      from: username,
      to: toUsername,
      status: "pending",
      timestamp: Date.now(),
    }

    persistentStorage.addFriendRequest(newRequest)
    alert(`Friend request sent to ${toUsername}`)
  }

  const filteredFriends = friends.filter((friend) => friend.username.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="myspace-profile-section">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#006699" }}>
          My Friends
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search friends or add new friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3" style={{ color: "#006699" }}>
              Friend Requests ({friendRequests.length})
            </h3>
            <div className="space-y-2">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {request.from[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{request.from}</div>
                      <div className="text-sm text-gray-500">{new Date(request.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => acceptFriendRequest(request.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => declineFriendRequest(request.id)}>
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Friend */}
        {searchQuery && !friends.some((f) => f.username === searchQuery) && (
          <div className="mb-6 p-4 border rounded-lg bg-white">
            <h3 className="font-bold text-lg mb-2">Add New Friend</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <div className="font-bold">{searchQuery}</div>
                  <div className="text-sm text-gray-500">Send a friend request</div>
                </div>
              </div>
              <Button onClick={() => sendFriendRequest(searchQuery)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: "#006699" }}>
            <Users className="w-5 h-5" />
            All Friends ({filteredFriends.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFriends.map((friend) => (
              <div key={friend.username} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {friend.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg">{friend.username}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          friend.status === "online" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {friend.status}
                      </span>
                    </div>
                    {friend.mood && <p className="text-sm text-gray-600 mb-2">{friend.mood}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Remove ${friend.username} from your friends?`)) {
                            removeFollowing(friend.username)
                            loadFriends()
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFriends.length === 0 && searchQuery === "" && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No friends yet</h3>
              <p className="text-gray-500 mt-1">Search for someone's username to send a friend request.</p>
            </div>
          )}

          {filteredFriends.length === 0 && searchQuery !== "" && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No friends found</h3>
              <p className="text-gray-500 mt-1">No friends found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
