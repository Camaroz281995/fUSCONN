"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreHorizontal, Send, Paperclip, Smile, ArrowLeft } from 'lucide-react'
import { formatDate } from "@/lib/utils"
import { persistentStorage } from "@/lib/persistent-storage"
import type { Message, Notification } from "@/lib/types"
import CallButton from "@/components/calling/call-button"

interface MessageThreadProps {
  recipientUsername: string
  onBack: () => void
}

export default function MessageThread({ recipientUsername, onBack }: MessageThreadProps) {
  const { username, profilePhoto } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (username) {
      const threadMessages = persistentStorage.getMessages(username, recipientUsername)
      setMessages(threadMessages)
    }
  }, [username, recipientUsername])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!username || !messageInput.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: username,
      recipientId: recipientUsername,
      content: messageInput.trim(),
      timestamp: Date.now(),
      type: "text",
      isRead: false,
    }

    persistentStorage.saveMessage(newMessage)
    setMessages((prev) => [...prev, newMessage])
    setMessageInput("")

    // Create notification for the recipient
    const messageNotification: Notification = {
      id: Date.now().toString(),
      type: "message",
      fromUsername: username,
      toUsername: recipientUsername,
      content: `${username}: ${newMessage.content}`,
      timestamp: Date.now(),
      isRead: false,
      messageId: newMessage.id
    }

    persistentStorage.saveNotification(messageNotification)

    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent("messageReceived"))
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8 mr-3">
              <AvatarFallback>{recipientUsername.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipientUsername}</CardTitle>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>

          <div className="flex gap-1">
            <CallButton recipientUsername={recipientUsername} />
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === username ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.senderId === username ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{formatDate(message.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {isTyping && (
          <div className="px-4 py-2">
            <div className="flex items-center text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{recipientUsername} is typing...</span>
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
