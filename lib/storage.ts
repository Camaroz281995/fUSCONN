// In-memory storage for the application
// This stores data during the server runtime and is shared across all users

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

// In-memory data stores
const users = new Map<string, User>()
const posts = new Map<string, Post>()
const communities = new Map<string, Community>()
const communityPosts = new Map<string, CommunityPost>()
const videos = new Map<string, any>()
const chats = new Map<string, any>()

export const storage = {
  // User operations
  users: {
    get: (username: string) => users.get(username),
    set: (username: string, user: User) => users.set(username, user),
    getAll: () => Array.from(users.values()),
  },

  // Post operations
  posts: {
    get: (id: string) => posts.get(id),
    set: (id: string, post: Post) => posts.set(id, post),
    getAll: () => Array.from(posts.values()).sort((a, b) => b.createdAt - a.createdAt),
    delete: (id: string) => posts.delete(id),
  },

  // Community operations
  communities: {
    get: (id: string) => communities.get(id),
    set: (id: string, community: Community) => communities.set(id, community),
    getAll: () => Array.from(communities.values()).sort((a, b) => b.createdAt - a.createdAt),
    getByUser: (username: string) => Array.from(communities.values()).filter((c) => c.members.includes(username)),
  },

  // Community post operations
  communityPosts: {
    get: (id: string) => communityPosts.get(id),
    set: (id: string, post: CommunityPost) => communityPosts.set(id, post),
    getByCommunity: (communityId: string) =>
      Array.from(communityPosts.values())
        .filter((p) => p.communityId === communityId)
        .sort((a, b) => b.createdAt - a.createdAt),
    delete: (id: string) => communityPosts.delete(id),
  },
}

export const kv = {
  get: async (key: string) => {
    if (key.startsWith("videos:")) {
      return videos.get(key)
    }
    if (key.startsWith("chats:")) {
      return chats.get(key)
    }
    return null
  },
  set: async (key: string, value: any) => {
    if (key.startsWith("videos:")) {
      videos.set(key, value)
    } else if (key.startsWith("chats:")) {
      chats.set(key, value)
    }
  },
  keys: async (pattern: string) => {
    if (pattern.startsWith("videos:")) {
      return Array.from(videos.keys())
    }
    if (pattern.startsWith("chats:")) {
      return Array.from(chats.keys())
    }
    return []
  },
  del: async (key: string) => {
    if (key.startsWith("videos:")) {
      videos.delete(key)
    } else if (key.startsWith("chats:")) {
      chats.delete(key)
    }
  },
}
