import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const dbChats = await storage.chats.getByUser(username)
    
    const chats = dbChats.map((chat) => ({
      id: chat.id,
      participants: [chat.user1, chat.user2],
      messages: chat.messages.map((m) => ({
        id: m.id,
        senderId: m.sender,
        content: m.content,
        timestamp: m.createdAt,
      })),
      lastMessage: chat.messages[chat.messages.length - 1]?.content,
      lastMessageTime: chat.messages[chat.messages.length - 1]?.createdAt,
    }))

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participants } = body

    if (!participants || participants.length !== 2) {
      return NextResponse.json({ error: "Two participants required" }, { status: 400 })
    }

    const [user1, user2] = participants

    const existingChats = await storage.chats.getByUser(user1)
    const existingChat = existingChats.find(
      (chat) => (chat.user1 === user1 && chat.user2 === user2) || (chat.user1 === user2 && chat.user2 === user1)
    )

    if (existingChat) {
      return NextResponse.json({
        chat: {
          id: existingChat.id,
          participants: [existingChat.user1, existingChat.user2],
          messages: existingChat.messages.map((m) => ({
            id: m.id,
            senderId: m.sender,
            content: m.content,
            timestamp: m.createdAt,
          })),
        },
      })
    }

    const newChat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user1,
      user2,
      createdAt: Date.now(),
    }

    await storage.chats.create(newChat)

    return NextResponse.json({
      chat: {
        id: newChat.id,
        participants: [user1, user2],
        messages: [],
      },
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
