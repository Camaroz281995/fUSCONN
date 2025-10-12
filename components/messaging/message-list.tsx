"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { persistentStorage } from "@/lib/persistent-storage"
import { formatDate } from "@/lib/utils"
import { MessageSquare } from "lucide-react"
import type { Conversation } from "@/lib/types"

interface MessageListProps {
  onConversationSelect: (otherUser: string) => void
  selectedConversation: string | null
}

export default function MessageList({ onConversationSelect, selectedConversation }: MessageListProps) {
  const { username } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (username) {
      loadConversations()
    }
  }, [username])

  const loadConversations = () => {
    if (!username) return
    const userConversations = persistentStorage.getConversations(username)
    setConversations(userConversations)
  }

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to view messages</h3>
          <p className="text-muted-foreground">Your conversations will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No conversations</h3>
              <p className="text-muted-foreground">Start messaging with friends!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.otherUser}
                  className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedConversation === conversation.otherUser ? "bg-muted" : ""
                  }`}
                  onClick={() => onConversationSelect(conversation.otherUser)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{conversation.otherUser.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.otherUser}</p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(conversation.lastMessageTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
