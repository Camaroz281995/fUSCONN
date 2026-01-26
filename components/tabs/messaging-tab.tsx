"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import MessageThread from "@/components/messaging/message-thread"
import { MessageCircle, Users, Search, Send } from 'lucide-react'
import type { Conversation } from "@/lib/types"

export default function MessagingTab() {
  const { username } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("conversations")

  useEffect(() => {
    if (username) {
      loadConversations()
      loadFriends()
    }
  }, [username])

  const loadConversations = () => {
    if (!username) return
    const userConversations = persistentStorage.getConversations(username)
    setConversations(userConversations)
  }

  const loadFriends = () => {
    if (!username) return
    // Get accepted friend requests where user is involved
    const friendRequests = persistentStorage.getFriendRequests()
    const userFriends = friendRequests
      .filter(req => 
        req.status === "accepted" && 
        (req.fromUsername === username || req.toUsername === username)
      )
      .map(req => req.fromUsername === username ? req.toUsername : req.fromUsername)
    
    setFriends(userFriends)
  }

  const startConversation = (otherUser: string) => {
    setSelectedConversation(otherUser)
    setActiveTab("conversations")
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFriends = friends.filter(friend =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!username) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please set your username to access messaging</p>
        </CardContent>
      </Card>
    )
  }

  if (selectedConversation) {
    return (
      <MessageThread
        otherUser={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations and friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversations
                {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {conversations.filter(c => c.unreadCount > 0).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends
                <Badge variant="secondary" className="ml-1">
                  {friends.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <Card
                      key={conversation.otherUser}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedConversation(conversation.otherUser)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.otherUser.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conversation.otherUser}
                              </p>
                              <div className="flex items-center gap-2">
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start messaging your friends!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="friends" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <Card
                      key={friend}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => startConversation(friend)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {friend.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friend}</p>
                              <p className="text-sm text-muted-foreground">
                                Fusionary Friend
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredFriends.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No friends yet</p>
                      <p className="text-sm">Add friends to start messaging!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
