import type { Post, Comment, MarketplaceListing, Story, FriendList, VirtualPet, MusicTrack, MusicPlaylist, LiveStream, LiveStreamComment, Message, Conversation, FriendRequest, Notification } from "./types"

// In-memory storage for development when KV is not available
class MemoryStorage {
  private store: Record<string, any> = {}
  private sets: Record<string, Set<string>> = {}

  async get(key: string) {
    return this.store[key] || null
  }

  async set(key: string, value: any) {
    this.store[key] = value
    return "OK"
  }

  async exists(key: string) {
    return key in this.store ? 1 : 0
  }

  async sadd(key: string, ...members: string[]) {
    if (!this.sets[key]) {
      this.sets[key] = new Set()
    }

    let added = 0
    for (const member of members) {
      if (!this.sets[key].has(member)) {
        this.sets[key].add(member)
        added++
      }
    }

    return added
  }

  async smembers(key: string) {
    return Array.from(this.sets[key] || new Set())
  }

  async scard(key: string) {
    return this.sets[key]?.size || 0
  }

  async sismember(key: string, member: string) {
    return this.sets[key]?.has(member) ? 1 : 0
  }

  async ping() {
    return "PONG"
  }
}

// Create an instance of the memory storage
const memoryStorage = new MemoryStorage()

// Export the memory storage as kv
export const kv = memoryStorage
