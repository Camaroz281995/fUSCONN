"use client"

import type { Chat } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { Users } from "lucide-react"

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  loading: boolean
}

export default function ChatList({ chats = [], selectedChat, onSelectChat, loading }: ChatListProps) {
  if (loading) {
    return <div className="text-center py-8">Loading chats...</div>
  }

  if (!chats || chats.length === 0) {
    return <div className="text-center py-8">No chats yet</div>
  }

  return (
    <div>
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
            selectedChat?.id === chat.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelectChat(chat)}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {chat.isGroup ? <Users className="h-5 w-5" /> : chat.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{chat.name}</h3>
              {chat.lastMessageTime && (
                <span className="text-xs text-muted-foreground">{formatDate(chat.lastMessageTime)}</span>
              )}
            </div>
            {chat.lastMessage && <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
