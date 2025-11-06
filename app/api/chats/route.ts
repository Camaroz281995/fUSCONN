import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"
import type { Chat } from "@/lib/types"
import { generateId } from "@/lib/utils"

// GET: Fetch chats for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Get all chat IDs for this user
    const chatIds = (await kv.smembers(`user:${username}:chats`)) as string[]

    if (!chatIds || chatIds.length === 0) {
      return NextResponse.json({ chats: [] })
    }

    // Get all chats with their data
    const chatsPromises = chatIds.map(async (id) => {
      const chat = (await kv.get(`chat:${id}`)) as Chat

      if (!chat) return null

      // Get last message if any
      const lastMessageId = await kv.get(`chat:${id}:lastMessage`)

      if (lastMessageId) {
        const lastMessage = await kv.get(`message:${lastMessageId}`)
        if (lastMessage) {
          chat.lastMessage = lastMessage.content
          chat.lastMessageTime = lastMessage.timestamp
        }
      }

      return chat
    })

    const chats = await Promise.all(chatsPromises)

    // Filter out any null chats and sort by last message time (newest first)
    const validChats = chats.filter(Boolean).sort((a: any, b: any) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0
      if (!a.lastMessageTime) return 1
      if (!b.lastMessageTime) return -1
      return b.lastMessageTime - a.lastMessageTime
    })

    return NextResponse.json({ chats: validChats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

// POST: Create a new chat
export async function POST(request: NextRequest) {
  try {
    const { name, creator, participants, isGroup } = await request.json()

    // Validate input
    if (!name || !creator || !participants || participants.length === 0) {
      return NextResponse.json({ error: "Name, creator, and participants are required" }, { status: 400 })
    }

    // Create a new chat
    const id = generateId()
    const timestamp = Date.now()

    const chat: Chat = {
      id,
      name,
      creator,
      participants,
      isGroup: !!isGroup,
    }

    // Save the chat
    await kv.set(`chat:${id}`, chat)

    // Add chat to each participant's list
    for (const participant of participants) {
      await kv.sadd(`user:${participant}:chats`, id)
    }

    return NextResponse.json({ chat }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
