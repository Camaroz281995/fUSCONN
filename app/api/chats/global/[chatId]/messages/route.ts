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

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params
    const body = await request.json()
    const { senderId, content } = body

    if (!senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const chat = chats.get(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const newMessage: Message = {
      id: `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      content,
      timestamp: Date.now(),
    }

    chat.messages.push(newMessage)
    chat.lastMessage = content
    chat.lastMessageTime = Date.now()

    chats.set(chatId, chat)

    return NextResponse.json({ message: newMessage, chat })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
