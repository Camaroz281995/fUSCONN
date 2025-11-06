export interface User {
  id: string
  username: string
  password: string
  bio?: string
  photoUrl?: string
  createdAt: number
}

export interface Post {
  id: string
  username: string
  content: string
  imageUrl?: string
  videoUrl?: string
  gifUrl?: string
  createdAt: number
  likes: string[]
  dislikes: string[]
  comments: Comment[]
}

export interface Comment {
  id: string
  username: string
  content: string
  createdAt: number
}

export interface Community {
  id: string
  name: string
  description: string
  creator: string
  members: string[]
  createdAt: number
}

export interface CommunityPost {
  id: string
  communityId: string
  username: string
  content: string
  createdAt: number
  upvotes: string[]
  downvotes: string[]
}

export interface Video {
  id: string
  username: string
  title: string
  url: string
  thumbnail?: string
  timestamp: number
  views: number
  likes: number
}

export interface UserProfile {
  username: string
  password?: string
  bio: string
  photoUrl: string
  backgroundUrl?: string
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundBrightness?: number
  backgroundParallax?: boolean
  backgroundFilter?: string
  friends: string[]
  communities?: string[]
  createdAt: number
}

export interface FriendRequest {
  id: string
  from: string
  to: string
  timestamp: number
  status: "pending" | "accepted" | "declined"
}

export interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  category: string
  seller: string
  imageUrl?: string
  contactInfo: string
  createdAt: number
}

export interface VirtualPet {
  id: string
  name: string
  type: string
  level: number
  experience: number
  hunger: number
  happiness: number
  lastFed: number
  lastPlayed: number
  owner: string
}

export interface LiveStream {
  id: string
  title: string
  streamer: string
  viewers: number
  thumbnail?: string
  category: string
  isLive: boolean
  startedAt: number
}

export interface Chat {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageTime?: number
}

export interface Message {
  id: string
  chatId: string
  sender: string
  content: string
  timestamp: number
  type?: "text" | "image" | "video"
  read: boolean
}
