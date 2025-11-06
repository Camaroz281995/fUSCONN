"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, X, User, Video, Lightbulb, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface SuggestionCard {
  type: "account" | "idea"
  title: string
  description: string
  icon: React.ReactNode
}

export default function FuzeAssistant() {
  const { username } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi${
            username ? ` ${username}` : ""
          }! I'm Fuze, your AI assistant for Fusion Connect. I can help you discover interesting accounts to follow and give you ideas for your next post. How can I help you today?`,
          timestamp: Date.now(),
        },
      ])
    }
  }, [username, messages.length])

  // Listen for custom event to open Fuze
  useEffect(() => {
    const handleOpenFuze = () => {
      setIsOpen(true)
    }

    window.addEventListener("openFuze", handleOpenFuze)

    return () => {
      window.removeEventListener("openFuze", handleOpenFuze)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/fuze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          username: username || "User",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from Fuze")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Example suggestion cards
  const suggestionCards: SuggestionCard[] = [
    {
      type: "account",
      title: "Find creative video creators",
      description: "Discover accounts with engaging video content",
      icon: <Video className="h-5 w-5" />,
    },
    {
      type: "idea",
      title: "Get content inspiration",
      description: "Ideas for your next viral post",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      type: "account",
      title: "Explore trending accounts",
      description: "See who's popular right now",
      icon: <User className="h-5 w-5" />,
    },
  ]

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    let promptText = ""

    switch (suggestion.title) {
      case "Find creative video creators":
        promptText = "Can you recommend some creative video creators I should follow?"
        break
      case "Get content inspiration":
        promptText = "I need some ideas for my next post. What's trending right now?"
        break
      case "Explore trending accounts":
        promptText = "Who are the most popular accounts I should check out?"
        break
      default:
        promptText = suggestion.description
    }

    setInput(promptText)

    // Auto-send if chat is already open
    if (isOpen) {
      setTimeout(() => {
        setInput(promptText)
        handleSend()
      }, 100)
    }

    setIsOpen(true)
  }

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg"
      >
        <Sparkles className="h-5 w-5" />
      </Button>

      {/* Chat interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md h-[80vh] flex flex-col">
            <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-primary">
                  <AvatarFallback className="text-primary-foreground">FZ</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">Fuze AI Assistant</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", {
                        "justify-end": message.role === "user",
                        "justify-start": message.role === "assistant",
                      })}
                    >
                      <div
                        className={cn("max-w-[80%] rounded-lg p-3", {
                          "bg-primary text-primary-foreground": message.role === "user",
                          "bg-muted": message.role === "assistant",
                        })}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fuze is thinking...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="p-4 grid grid-cols-1 gap-3">
                  {suggestionCards.map((card, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex justify-start h-auto p-3"
                      onClick={() => handleSuggestionClick(card)}
                    >
                      <div className="mr-3 p-2 rounded-full bg-primary/10">{card.icon}</div>
                      <div className="text-left">
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t p-3">
              <div className="flex w-full items-center gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask Fuze something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
