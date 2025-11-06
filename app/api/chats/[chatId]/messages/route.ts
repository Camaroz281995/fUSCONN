import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"
import type { ChatMessage } from "@/lib/types"
import { generateId } from "@/lib/utils"

// GET: Fetch messages for a chat
export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId

    // Check if chat exists
    const chatExists = await kv.exists(`chat:${chatId}`)

    if (!chatExists) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Get all message IDs for this chat
    const messageIds = (await kv.smembers(`chat:${chatId}:messages`)) as string[]

    if (!messageIds || messageIds.length === 0) {
      return NextResponse.json({ messages: [] })
    }

    // Get all messages with their data
    const messagesPromises = messageIds.map(async (id) => {
      return await kv.get(`message:${id}`)
    })

    const messages = await Promise.all(messagesPromises)

    // Filter out any null messages and sort by timestamp
    const validMessages = messages.filter(Boolean).sort((a: any, b: any) => a.timestamp - b.timestamp)

    return NextResponse.json({ messages: validMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST: Add a message to a chat
export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId
    const { username, content } = await request.json()

    // Validate input
    if (!username || !content) {
      return NextResponse.json({ error: "Username and content are required" }, { status: 400 })
    }

    // Check if chat exists
    const chatExists = await kv.exists(`chat:${chatId}`)

    if (!chatExists) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant in the chat
    const chat = await kv.get(`chat:${chatId}`)
    if (!chat || !chat.participants.includes(username)) {
      return NextResponse.json({ error: "User is not a participant in this chat" }, { status: 403 })
    }

    // Create a new message
    const id = generateId()
    const timestamp = Date.now()

    const message: ChatMessage = {
      id,
      chatId,
      username,
      content,
      timestamp,
    }

    // Save the message
    await kv.set(`message:${id}`, message)
    await kv.sadd(`chat:${chatId}:messages`, id)

    // Update last message for the chat
    await kv.set(`chat:${chatId}:lastMessage`, id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
