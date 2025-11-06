"use client"

import { useRef, useEffect } from "react"
import type { ChatMessage } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface ChatMessagesProps {
  messages: ChatMessage[]
  currentUsername: string
}

export default function ChatMessages({ messages = [], currentUsername }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 h-[calc(100vh-350px)]" ref={scrollRef}>
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.username === currentUsername

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{message.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className={`flex items-baseline gap-2 ${isCurrentUser ? "justify-end" : ""}`}>
                    {!isCurrentUser && <span className="font-semibold text-sm">{message.username}</span>}
                    <span className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</span>
                  </div>
                  <div
                    className={`mt-1 p-3 rounded-lg ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
