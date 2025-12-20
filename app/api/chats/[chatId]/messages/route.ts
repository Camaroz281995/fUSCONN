import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { type ChatMessage } from "@/lib/types"

// GET: Fetch messages for a chat
export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params
    
    const username = request.nextUrl.searchParams.get("username")
    
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const chats = await storage.chats.getByUser(username)
    const chat = chats.find(c => c.id === chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json(chat.messages || [])
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST: Add a message to a chat
export async function POST(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { sender, content } = await request.json()
    const { chatId } = await params

    if (!sender || !content) {
      return NextResponse.json({ error: "Sender and content required" }, { status: 400 })
    }

    const message = {
      id: Date.now().toString(),
      sender,
      content,
      createdAt: Date.now(),
    }

    await storage.chats.addMessage(chatId, message)

    const chat = await storage.chats.get(chatId)

    return NextResponse.json(chat)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
