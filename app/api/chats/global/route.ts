export const runtime = "edge"

import { NextResponse } from "next/server"

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

const chats = new Map<string, Chat>()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const userChats = Array.from(chats.values())
      .filter((chat) => chat.participants.includes(username))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))

    return NextResponse.json({ chats: userChats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participants, username } = body

    if (!participants || participants.length !== 2 || !username) {
      return NextResponse.json({ error: "Invalid participants" }, { status: 400 })
    }

    const existingChat = Array.from(chats.values()).find(
      (chat) => chat.participants.includes(participants[0]) && chat.participants.includes(participants[1]),
    )

    if (existingChat) {
      return NextResponse.json({ chat: existingChat })
    }

    const newChat: Chat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participants,
      messages: [],
    }

    chats.set(newChat.id, newChat)

    return NextResponse.json({ chat: newChat })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
