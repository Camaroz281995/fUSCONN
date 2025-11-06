"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, Plus, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: number
}

interface Chat {
  id: string
  participants: string[]
  messages: Message[]
  lastMessage?: string
  lastMessageTime?: number
}

interface ChatsTabProps {
  username: string
}

export default function ChatsTab({ username }: ChatsTabProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageText, setMessageText] = useState("")
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatUsername, setNewChatUsername] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChats = () => {
    try {
      const stored = localStorage.getItem("fusconn-global-chats")
      if (stored) {
        setChats(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading chats:", error)
    }
  }

  const saveChats = (updatedChats: Chat[]) => {
    localStorage.setItem("fusconn-global-chats", JSON.stringify(updatedChats))
    setChats(updatedChats)
  }

  const handleCreateChat = () => {
    if (!username) {
      alert("Please sign in to start a chat")
      return
    }

    if (!newChatUsername.trim()) {
      alert("Please enter a username")
      return
    }

    if (newChatUsername.toLowerCase() === username.toLowerCase()) {
      alert("You can't chat with yourself")
      return
    }

    const existingChat = chats.find(
      (chat) => chat.participants.includes(username) && chat.participants.includes(newChatUsername),
    )

    if (existingChat) {
      setSelectedChat(existingChat)
      setShowNewChatDialog(false)
      setNewChatUsername("")
      return
    }

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      participants: [username, newChatUsername],
      messages: [],
    }

    const updatedChats = [newChat, ...chats]
    saveChats(updatedChats)
    setSelectedChat(newChat)
    setShowNewChatDialog(false)
    setNewChatUsername("")
  }

  const handleSendMessage = () => {
    if (!username || !selectedChat) {
      alert("Please sign in to send messages")
      return
    }

    if (!messageText.trim()) return

    const newMessage: Message = {
      id: `message-${Date.now()}`,
      senderId: username,
      content: messageText.trim(),
      timestamp: Date.now(),
    }

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: messageText.trim(),
          lastMessageTime: Date.now(),
        }
      }
      return chat
    })

    saveChats(updatedChats)
    setMessageText("")

    const updated = updatedChats.find((c) => c.id === selectedChat.id)
    if (updated) setSelectedChat(updated)
  }

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p !== username) || "Unknown"
  }

  if (!username) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to use messaging</p>
        </CardContent>
      </Card>
    )
  }

  if (selectedChat) {
    const otherUser = getOtherParticipant(selectedChat)

    return (
      <div className="space-y-4">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback>{otherUser.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">@{otherUser}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-4 border rounded-lg">
              {selectedChat.messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
              ) : (
                selectedChat.messages.map((message) => {
                  const isOwn = message.senderId === username
                  return (
                    <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
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
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
            </CardTitle>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter username..."
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateChat()
                      }
                    }}
                  />
                  <Button onClick={handleCreateChat} className="w-full">
                    Start Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {chats.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No chats yet</h3>
            <p className="text-muted-foreground mb-4">Start a conversation with someone!</p>
            <Button onClick={() => setShowNewChatDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chats
            .filter((chat) => chat.participants.includes(username))
            .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
            .map((chat) => {
              const otherUser = getOtherParticipant(chat)
              return (
                <Card
                  key={chat.id}
                  className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{otherUser.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">@{otherUser}</span>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
