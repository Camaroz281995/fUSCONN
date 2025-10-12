"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageCircle, Send, Search, Plus, Phone, Video } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId, formatTime } from "@/lib/utils"
import type { Message, User } from "@/lib/types"

export default function MessagingTab() {
  const { username } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [newChatUsername, setNewChatUsername] = useState("")
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)

  useEffect(() => {
    loadMessages()
    loadUsers()

    // Simulate P2P message sync
    const interval = setInterval(() => {
      syncP2PMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadMessages = () => {
    const allMessages = persistentStorage.getMessages()
    setMessages(allMessages)
  }

  const loadUsers = () => {
    const allUsers = persistentStorage.getUsers()
    setUsers(allUsers.filter((u) => u.username !== username))
  }

  const syncP2PMessages = () => {
    // Simulate P2P message synchronization
    // In a real P2P implementation, this would sync with other peers
    loadMessages()
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !username) return

    const message: Message = {
      id: generateId(),
      sender: username,
      recipient: selectedUser,
      content: newMessage.trim(),
      timestamp: Date.now(),
      read: false,
    }

    // Save locally and broadcast to P2P network
    persistentStorage.addMessage(message)
    broadcastMessageP2P(message)

    setNewMessage("")
    loadMessages()
  }

  const broadcastMessageP2P = (message: Message) => {
    // Simulate P2P message broadcasting
    // In a real implementation, this would send to connected peers
    console.log("Broadcasting message to P2P network:", message)

    // Simulate message delivery to recipient's device
    setTimeout(() => {
      const deliveredMessage = { ...message, delivered: true }
      persistentStorage.updateMessage(deliveredMessage)
    }, 1000)
  }

  const startNewChat = () => {
    if (!newChatUsername.trim()) return

    // Check if user exists (in P2P network)
    const userExists = users.some((u) => u.username.toLowerCase() === newChatUsername.toLowerCase())

    if (userExists) {
      setSelectedUser(newChatUsername)
      setShowNewChatDialog(false)
      setNewChatUsername("")
    } else {
      alert("User not found in the network")
    }
  }

  const getConversations = () => {
    if (!username) return []

    const userMessages = messages.filter((m) => m.sender === username || m.recipient === username)

    const conversations = new Map<string, Message[]>()

    userMessages.forEach((message) => {
      const otherUser = message.sender === username ? message.recipient : message.sender
      if (!conversations.has(otherUser)) {
        conversations.set(otherUser, [])
      }
      conversations.get(otherUser)!.push(message)
    })

    return Array.from(conversations.entries()).map(([user, msgs]) => ({
      user,
      messages: msgs.sort((a, b) => b.timestamp - a.timestamp),
      lastMessage: msgs.sort((a, b) => b.timestamp - a.timestamp)[0],
      unreadCount: msgs.filter((m) => m.recipient === username && !m.read).length,
    }))
  }

  const getMessagesWithUser = (otherUser: string) => {
    if (!username) return []

    return messages
      .filter(
        (m) =>
          (m.sender === username && m.recipient === otherUser) || (m.sender === otherUser && m.recipient === username),
      )
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  const conversations = getConversations()
  const filteredConversations = conversations.filter(({ user }) =>
    user.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedUser) {
    const userMessages = getMessagesWithUser(selectedUser)

    return (
      <div className="space-y-4">
        {/* Chat Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  ←
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={persistentStorage.getProfilePhoto(selectedUser) || undefined} />
                  <AvatarFallback>{selectedUser.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">@{selectedUser}</h3>
                  <p className="text-xs text-muted-foreground">P2P Connected</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                userMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.sender === username ? "bg-blue-500 text-white" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === username ? "text-blue-100" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </div>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Input
                      placeholder="Enter username..."
                      value={newChatUsername}
                      onChange={(e) => setNewChatUsername(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && startNewChat()}
                    />
                  </div>
                  <Button onClick={startNewChat} className="w-full" disabled={!newChatUsername.trim()}>
                    Start Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversations */}
      <Card>
        <CardContent className="p-0">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <p className="text-muted-foreground text-xs">Start a new chat to connect via P2P</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
                <div
                  key={user}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={persistentStorage.getProfilePhoto(user) || undefined} />
                      <AvatarFallback>{user.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">@{user}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatTime(lastMessage.timestamp)}</span>
                          {unreadCount > 0 && (
                            <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessage.sender === username ? "You: " : ""}
                        {lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
