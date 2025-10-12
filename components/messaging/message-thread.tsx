"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { persistentStorage } from "@/lib/persistent-storage"
import { formatDate, generateId } from "@/lib/utils"
import CallButton from "@/components/calling/call-button"
import { Send } from "lucide-react"
import type { Message } from "@/lib/types"

interface MessageThreadProps {
  otherUser: string
  onMessageSent?: () => void
}

export default function MessageThread({ otherUser, onMessageSent }: MessageThreadProps) {
  const { username } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (username && otherUser) {
      loadMessages()
    }
  }, [username, otherUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    if (!username || !otherUser) return
    const threadMessages = persistentStorage.getMessages(username, otherUser)
    setMessages(threadMessages)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!username || !newMessage.trim()) return

    setIsLoading(true)

    try {
      const message: Message = {
        id: generateId(),
        senderId: username,
        recipientId: otherUser,
        content: newMessage.trim(),
        timestamp: Date.now(),
        type: "text",
        isRead: false,
      }

      persistentStorage.saveMessage(message)
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!username) {
    return null
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarFallback>{otherUser.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{otherUser}</span>
          </div>
          <div className="flex gap-2">
            <CallButton recipientUsername={otherUser} />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === username
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"
                        }`}
                      >
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
