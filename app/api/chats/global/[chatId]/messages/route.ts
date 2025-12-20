import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

// GET: Fetch messages for a chat
export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const chat = await storage.chats.get(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ messages: chat.messages || [] })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST: Add message to chat
export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const body = await request.json()
    const { senderId, content } = body

    if (!senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const message = {
      id: `message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: senderId,
      content,
      createdAt: Date.now(),
    }

    await storage.chats.addMessage(chatId, message)

    const updatedChat = await storage.chats.get(chatId)

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({
      chat: {
        id: updatedChat.id,
        participants: [updatedChat.user1, updatedChat.user2],
        messages: updatedChat.messages.map((m) => ({
          id: m.id,
          senderId: m.sender,
          content: m.content,
          timestamp: m.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
