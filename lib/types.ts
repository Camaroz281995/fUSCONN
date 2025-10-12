export interface User {
  id: string
  username: string
  email: string
  createdAt: number
}

export interface Post {
  id: string
  username: string
  content: string
  timestamp: number
  likes: string[]
  dislikes: string[]
  comments: Comment[]
  hashtags: string[]
  mentions: string[]
  image?: string
  video?: string
}

export interface Comment {
  id: string
  username: string
  content: string
  timestamp: number
  likes: string[]
}

export interface Message {
  id: string
  sender: string
  recipient: string
  content: string
  timestamp: number
  read: boolean
  delivered?: boolean
}

export interface Community {
  id: string
  name: string
  description: string
  owner: string
  members: string[]
  isPrivate: boolean
  inviteCode?: string
  createdAt: number
}

export interface VirtualPet {
  id: string
  name: string
  type: "dog" | "cat" | "hamster"
  emoji: string
  owner: string
  happiness: number
  hunger: number
  energy: number
  level: number
  experience: number
  lastInteraction: number
  createdAt: number
}

export interface CallRecord {
  id: string
  caller: string
  recipient: string
  type: "voice" | "video"
  status: "calling" | "connected" | "ended" | "missed"
  startTime: number
  endTime?: number
  duration: number
}

export interface LiveStream {
  id: string
  streamer: string
  title: string
  description: string
  viewers: number
  isActive: boolean
  startTime: number
  endTime?: number
  category: string
}

export interface MarketplaceListing {
  id: string
  seller: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  image?: string
  createdAt: number
}
