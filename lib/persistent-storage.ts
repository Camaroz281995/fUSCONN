import type {
  Post,
  Comment,
  MarketplaceListing,
  Story,
  FriendList,
  VirtualPet,
  MusicTrack,
  MusicPlaylist,
  LiveStream,
  Message,
  Conversation,
  FriendRequest,
  Notification,
  Community,
  CallRecord,
} from "./types"

interface User {
  id: string
  username: string
  email: string
  password: string
  profilePhoto?: string
  joinDate: number
  following: string[]
  followers: string[]
}

class PersistentStorage {
  private readonly USERS_KEY = "fusionary_connectra_users"
  private readonly POSTS_KEY = "fusionary_connectra_posts"
  private readonly PROFILE_PHOTOS_KEY = "fusionary_connectra_profile_photos"
  private readonly FOLLOWING_KEY = "fusionary_connectra_following"
  private readonly DEFAULT_POSTS_LOADED_KEY = "fusionary_connectra_default_posts_loaded"

  private getStorageKey(key: string): string {
    return `fusionary_connectra_${key}`
  }

  // Helper function to get data from localStorage
  private getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue

    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue

    try {
      return JSON.parse(stored) as T
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Helper function to save data to localStorage
  private saveToStorage<T>(key: string, data: T): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  // Users
  saveUsers(users: User[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    }
  }

  getUsers(): User[] {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(this.USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  saveUser(user: User): void {
    const users = this.getUsers()
    const existingIndex = users.findIndex((u) => u.id === user.id)

    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }

    this.saveUsers(users)
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
  }

  getUser(username: string): User | null {
    const users = this.getUsers()
    return users.find((u) => u.username === username) || null
  }

  isUsernameAvailable(username: string): boolean {
    const users = this.getUsers()
    return !users.some((user) => user.username.toLowerCase() === username.toLowerCase())
  }

  isEmailAvailable(email: string): boolean {
    const users = this.getUsers()
    return !users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem(this.getStorageKey("current_user"))
    return user ? JSON.parse(user) : null
  }

  setCurrentUser(user: User): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.getStorageKey("current_user"), JSON.stringify(user))
  }

  clearCurrentUser(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.getStorageKey("current_user"))
  }

  getUserProfile(username: string): { bio?: string; displayName?: string } | null {
    const profile = localStorage.getItem(`fuscon_profile_${username}`)
    return profile ? JSON.parse(profile) : null
  }

  updateUserProfile(username: string, profile: { bio?: string; displayName?: string }): void {
    localStorage.setItem(`fuscon_profile_${username}`, JSON.stringify(profile))
  }

  // Posts
  savePosts(posts: Post[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))
    }
  }

  getPosts(): Post[] {
    if (typeof window === "undefined") return []
    const posts = localStorage.getItem(this.POSTS_KEY)
    return posts ? JSON.parse(posts) : []
  }

  savePost(post: Post): void {
    const posts = this.getPosts()
    posts.unshift(post)
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))

    // Trigger P2P sync event
    window.dispatchEvent(new CustomEvent("p2pPostSync", { detail: post }))
  }

  addPost(post: Post): void {
    this.savePost(post)
  }

  deletePost(postId: string): void {
    const posts = this.getPosts()
    const updatedPosts = posts.filter((post) => post.id !== postId)
    this.savePosts(updatedPosts)
  }

  updatePost(postId: string, updates: Partial<Post>): void {
    const posts = this.getPosts()
    const index = posts.findIndex((p) => p.id === postId)
    if (index >= 0) {
      posts[index] = { ...posts[index], ...updates }
      this.savePosts(posts)
    }
  }

  toggleLike(postId: string, username: string): void {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (post) {
      if (!post.likes) post.likes = []
      const likeIndex = post.likes.indexOf(username)
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1)
      } else {
        post.likes.push(username)
      }
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))
    }
  }

  toggleDislike(postId: string, username: string): void {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (post) {
      const dislikeIndex = post.dislikes.indexOf(username)
      if (dislikeIndex > -1) {
        post.dislikes.splice(dislikeIndex, 1)
      } else {
        post.dislikes.push(username)
        // Remove from likes if present
        const likeIndex = post.likes.indexOf(username)
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1)
        }
      }
      this.savePosts(posts)
    }
  }

  // Comments
  addComment(postId: string, comment: Comment): void {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (post) {
      if (!post.comments) post.comments = []
      post.comments.push(comment)
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))
    }
  }

  saveComment(postId: string, comment: Comment): void {
    this.addComment(postId, comment)
  }

  // Communities
  saveCommunities(communities: Community[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("fuscon_communities", JSON.stringify(communities))
    }
  }

  getCommunities(): Community[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("fuscon_communities")
    return stored ? JSON.parse(stored) : []
  }

  saveCommunity(community: Community): void {
    const communities = this.getCommunities()
    const existingIndex = communities.findIndex((c) => c.id === community.id)

    if (existingIndex >= 0) {
      communities[existingIndex] = community
    } else {
      communities.push(community)
    }

    this.saveCommunities(communities)
  }

  getUserCommunities(username: string): Community[] {
    const allCommunities = this.getCommunities()
    return allCommunities.filter((c) => c.members.includes(username))
  }

  getPublicCommunities(): Community[] {
    const allCommunities = this.getCommunities()
    return allCommunities.filter((c) => c.isPublic)
  }

  deleteCommunity(communityId: string): void {
    const communities = this.getCommunities()
    const updatedCommunities = communities.filter((c) => c.id !== communityId)
    this.saveCommunities(updatedCommunities)
  }

  joinCommunity(communityId: string, username: string): void {
    if (typeof window === "undefined") return
    try {
      const communities = this.getCommunities()
      const community = communities.find((c) => c.id === communityId)

      if (community && !community.members.includes(username)) {
        community.members.push(username)
        community.memberCount = community.members.length
        community.updatedAt = Date.now()

        this.saveCommunities(communities)
      }
    } catch (error) {
      console.error("Error joining community:", error)
    }
  }

  leaveCommunity(communityId: string, username: string): void {
    if (typeof window === "undefined") return
    try {
      const communities = this.getCommunities()
      const community = communities.find((c) => c.id === communityId)

      if (community && community.creator !== username) {
        community.members = community.members.filter((m) => m !== username)
        community.memberCount = community.members.length
        community.updatedAt = Date.now()

        this.saveCommunities(communities)
      }
    } catch (error) {
      console.error("Error leaving community:", error)
    }
  }

  addCommunity(community: Community): void {
    const communities = this.getCommunities()
    communities.push(community)
    this.saveCommunities(communities)
  }

  // Marketplace
  saveMarketplaceListings(listings: MarketplaceListing[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("fuscon_marketplace", JSON.stringify(listings))
    }
  }

  getMarketplaceListings(): MarketplaceListing[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("fuscon_marketplace")
    return stored ? JSON.parse(stored) : []
  }

  saveMarketplaceListing(listing: MarketplaceListing): void {
    const listings = this.getMarketplaceListings()
    const existingIndex = listings.findIndex((l) => l.id === listing.id)

    if (existingIndex >= 0) {
      listings[existingIndex] = listing
    } else {
      listings.unshift(listing)
    }

    this.saveMarketplaceListings(listings)
  }

  deleteMarketplaceListing(listingId: string): void {
    const listings = this.getMarketplaceListings()
    const updatedListings = listings.filter((listing) => listing.id !== listingId)
    this.saveMarketplaceListings(updatedListings)
  }

  getListings(): MarketplaceListing[] {
    if (typeof window === "undefined") return []
    const listings = localStorage.getItem(this.getStorageKey("listings"))
    return listings ? JSON.parse(listings) : []
  }

  saveListings(listings: MarketplaceListing[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.getStorageKey("listings"), JSON.stringify(listings))
    }
  }

  addListing(listing: MarketplaceListing): void {
    const listings = this.getListings()
    listings.push(listing)
    this.saveListings(listings)
  }

  // Stories
  saveStory(story: Story): void {
    const stories = this.getStories()
    stories.unshift(story)
    this.saveStories(stories)
  }

  getStories(): Story[] {
    if (typeof window === "undefined") return []
    const stories = localStorage.getItem(this.getStorageKey("stories"))
    const allStories = stories ? JSON.parse(stories) : []
    // Filter out expired stories
    const now = Date.now()
    const activeStories = allStories.filter((story: Story) => story.expiresAt > now)
    if (activeStories.length !== allStories.length) {
      this.saveStories(activeStories)
    }
    return activeStories
  }

  saveStories(stories: Story[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.getStorageKey("stories"), JSON.stringify(stories))
    }
  }

  addStory(story: Story): void {
    const stories = this.getStories()
    stories.push(story)
    this.saveStories(stories)
  }

  deleteStory(storyId: string): void {
    const stories = this.getStories()
    const updatedStories = stories.filter((story) => story.id !== storyId)
    this.saveStories(updatedStories)
  }

  // Friend Lists
  saveFriendList(friendList: FriendList): void {
    const lists = this.getFriendLists()
    const existingIndex = lists.findIndex((l) => l.id === friendList.id)

    if (existingIndex >= 0) {
      lists[existingIndex] = friendList
    } else {
      lists.push(friendList)
    }

    this.saveToStorage("friend_lists", lists)
  }

  getFriendLists(): FriendList[] {
    return this.getFromStorage<FriendList[]>("friend_lists", [])
  }

  getUserFriendLists(username: string): FriendList[] {
    const lists = this.getFriendLists()
    return lists.filter((list) => list.owner === username)
  }

  deleteFriendList(listId: string): void {
    const lists = this.getFriendLists()
    const updatedLists = lists.filter((list) => list.id !== listId)
    this.saveToStorage("friend_lists", updatedLists)
  }

  // Virtual Pet
  saveUserPet(pet: VirtualPet): void {
    if (typeof window !== "undefined") {
      const pets = this.getAllPets()
      const existingIndex = pets.findIndex((p) => p.owner === pet.owner)

      if (existingIndex >= 0) {
        pets[existingIndex] = pet
      } else {
        pets.push(pet)
      }

      localStorage.setItem(this.getStorageKey("pets"), JSON.stringify(pets))
    }
  }

  getUserPet(username: string): VirtualPet | null {
    if (typeof window === "undefined") return null
    const pets = this.getAllPets()
    return pets.find((pet) => pet.owner === username) || null
  }

  getAllPets(): VirtualPet[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.getStorageKey("pets"))
    return stored ? JSON.parse(stored) : []
  }

  getUserPets(username: string): VirtualPet[] {
    const pets = localStorage.getItem(`fuscon_pets_${username}`)
    return pets ? JSON.parse(pets) : []
  }

  saveUserPets(username: string, pets: VirtualPet[]): void {
    localStorage.setItem(`fuscon_pets_${username}`, JSON.stringify(pets))
  }

  // Music
  saveMusicTrack(track: MusicTrack): void {
    const tracks = this.getMusicTracks()
    tracks.push(track)
    this.saveToStorage("tracks", tracks)
  }

  getMusicTracks(): MusicTrack[] {
    return this.getFromStorage<MusicTrack[]>("tracks", [])
  }

  saveMusicPlaylist(playlist: MusicPlaylist): void {
    const playlists = this.getMusicPlaylists()
    const existingIndex = playlists.findIndex((p) => p.id === playlist.id)

    if (existingIndex >= 0) {
      playlists[existingIndex] = playlist
    } else {
      playlists.push(playlist)
    }

    this.saveToStorage("playlists", playlists)
  }

  savePlaylist(playlist: MusicPlaylist): void {
    this.saveMusicPlaylist(playlist)
  }

  getMusicPlaylists(): MusicPlaylist[] {
    return this.getFromStorage<MusicPlaylist[]>("playlists", [])
  }

  getUserPlaylists(username: string): MusicPlaylist[] {
    const playlists = this.getMusicPlaylists()
    return playlists.filter((playlist) => playlist.owner === username)
  }

  deletePlaylist(playlistId: string): void {
    const playlists = this.getMusicPlaylists()
    const updatedPlaylists = playlists.filter((playlist) => playlist.id !== playlistId)
    this.saveToStorage("playlists", updatedPlaylists)
  }

  saveUserLikedTracks(username: string, trackIds: string[]): void {
    const likedTracks = this.getFromStorage<Record<string, string[]>>("liked_tracks", {})
    likedTracks[username] = trackIds
    this.saveToStorage("liked_tracks", likedTracks)
  }

  getUserLikedTracks(username: string): string[] {
    const likedTracks = this.getFromStorage<Record<string, string[]>>("liked_tracks", {})
    return likedTracks[username] || []
  }

  // Live Streaming
  saveLiveStreams(streams: LiveStream[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("fuscon_streams", JSON.stringify(streams))
    }
  }

  getLiveStreams(): LiveStream[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("fuscon_streams")
    return stored ? JSON.parse(stored) : []
  }

  saveLiveStream(stream: LiveStream): void {
    const streams = this.getLiveStreams()
    const existingIndex = streams.findIndex((s) => s.id === stream.id)

    if (existingIndex >= 0) {
      streams[existingIndex] = stream
    } else {
      streams.unshift(stream)
    }

    this.saveLiveStreams(streams)
  }

  deleteLiveStream(streamId: string): void {
    const streams = this.getLiveStreams()
    const updatedStreams = streams.filter((stream) => stream.id !== streamId)
    this.saveLiveStreams(updatedStreams)
  }

  endLiveStream(streamId: string): void {
    const streams = this.getLiveStreams()
    const stream = streams.find((s) => s.id === streamId)
    if (stream) {
      stream.isActive = false
      stream.endTime = Date.now()
      localStorage.setItem("fuscon_streams", JSON.stringify(streams))
    }
  }

  // Messages - Real-time peer-to-peer messaging
  saveMessages(messages: Message[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("fuscon_messages", JSON.stringify(messages))
    }
  }

  getMessages(): Message[] {
    if (typeof window === "undefined") return []
    const messages = localStorage.getItem("fuscon_messages")
    return messages ? JSON.parse(messages) : []
  }

  saveMessage(message: Message): void {
    if (typeof window === "undefined") return
    try {
      const messages = this.getMessages()
      messages.push(message)
      this.saveMessages(messages)

      // Update conversations
      this.updateConversation(message)

      // Trigger real-time update event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("newMessage", { detail: message }))
      }
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  addMessage(message: Message): void {
    const messages = this.getMessages()
    messages.push(message)
    localStorage.setItem("fuscon_messages", JSON.stringify(messages))

    // Trigger P2P message sync
    window.dispatchEvent(new CustomEvent("p2pMessageSync", { detail: message }))
  }

  updateMessage(message: Message): void {
    const messages = this.getMessages()
    const index = messages.findIndex((m) => m.id === message.id)
    if (index > -1) {
      messages[index] = message
      localStorage.setItem("fuscon_messages", JSON.stringify(messages))
    }
  }

  getAllMessages(): Message[] {
    return this.getMessages()
  }

  getMessagesByUser(user1: string, user2: string): Message[] {
    if (typeof window === "undefined") return []
    try {
      const messages = this.getMessages()
      return messages
        .filter((m) => (m.sender === user1 && m.recipient === user2) || (m.sender === user2 && m.recipient === user1))
        .sort((a, b) => a.timestamp - b.timestamp)
    } catch {
      return []
    }
  }

  getConversations(username: string): Conversation[] {
    if (typeof window === "undefined") return []
    try {
      const conversations = this.getFromStorage<Conversation[]>("conversations", [])
      return conversations.filter((c) => c.username === username).sort((a, b) => b.lastMessageTime - a.lastMessageTime)
    } catch {
      return []
    }
  }

  getAllConversations(): Conversation[] {
    return this.getFromStorage<Conversation[]>("conversations", [])
  }

  private updateConversation(message: Message): void {
    try {
      const conversations = this.getFromStorage<Conversation[]>("conversations", [])

      // Update sender's conversation list
      const senderConv = conversations.find((c) => c.username === message.sender && c.otherUser === message.recipient)

      if (senderConv) {
        senderConv.lastMessage = message.content
        senderConv.lastMessageTime = message.timestamp
      } else {
        conversations.push({
          username: message.sender,
          otherUser: message.recipient,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          unreadCount: 0,
        })
      }

      // Update recipient's conversation list
      const recipientConv = conversations.find(
        (c) => c.username === message.recipient && c.otherUser === message.sender,
      )

      if (recipientConv) {
        recipientConv.lastMessage = message.content
        recipientConv.lastMessageTime = message.timestamp
        recipientConv.unreadCount += 1
      } else {
        conversations.push({
          username: message.recipient,
          otherUser: message.sender,
          lastMessage: message.content,
          lastMessageTime: message.timestamp,
          unreadCount: 1,
        })
      }

      this.saveToStorage("conversations", conversations)
    } catch (error) {
      console.error("Error updating conversation:", error)
    }
  }

  // Friend Requests
  saveFriendRequest(friendRequest: FriendRequest): void {
    const requests = this.getFriendRequests()
    requests.push(friendRequest)
    this.saveToStorage("friend_requests", requests)
  }

  getFriendRequests(): FriendRequest[] {
    return this.getFromStorage<FriendRequest[]>("friend_requests", [])
  }

  updateFriendRequestStatus(requestId: string, status: "accepted" | "declined"): void {
    if (typeof window === "undefined") return
    try {
      const requests = this.getFriendRequests()
      const requestIndex = requests.findIndex((r) => r.id === requestId)

      if (requestIndex !== -1) {
        requests[requestIndex].status = status
        this.saveToStorage("friend_requests", requests)
      }
    } catch (error) {
      console.error("Error updating friend request status:", error)
    }
  }

  // Notifications
  saveNotification(notification: Notification): void {
    if (typeof window !== "undefined") {
      const notifications = this.getNotifications()
      notifications.unshift(notification)
      this.saveToStorage("notifications", notifications)
    }
  }

  getNotifications(): Notification[] {
    return this.getFromStorage<Notification[]>("notifications", [])
  }

  getUserNotifications(username: string): Notification[] {
    if (typeof window === "undefined") return []
    try {
      const notifications = this.getNotifications()
      return notifications.filter((n) => n.toUsername === username).sort((a, b) => b.timestamp - a.timestamp)
    } catch {
      return []
    }
  }

  getAllNotifications(): Notification[] {
    return this.getFromStorage<Notification[]>("notifications", [])
  }

  markNotificationAsRead(notificationId: string): void {
    if (typeof window === "undefined") return
    try {
      const notifications = this.getNotifications()
      const notificationIndex = notifications.findIndex((n) => n.id === notificationId)

      if (notificationIndex !== -1) {
        notifications[notificationIndex].isRead = true
        this.saveToStorage("notifications", notifications)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Usernames (for availability checking)
  getUsernames(): string[] {
    return this.getFromStorage<string[]>("usernames", [])
  }

  addUsername(username: string): void {
    if (typeof window !== "undefined") {
      try {
        const usernames = this.getUsernames()
        if (!usernames.includes(username)) {
          usernames.push(username)
          this.saveToStorage("usernames", usernames)
        }
      } catch (error) {
        console.error("Error adding username:", error)
      }
    }
  }

  // Following relationships
  saveFollowing(username: string, following: string[]): void {
    if (typeof window !== "undefined") {
      const followingData = localStorage.getItem(this.FOLLOWING_KEY)
      const followingMap = followingData ? JSON.parse(followingData) : {}
      followingMap[username] = following
      localStorage.setItem(this.FOLLOWING_KEY, JSON.stringify(followingMap))
    }
  }

  getFollowing(username: string): string[] {
    if (typeof window === "undefined") return []
    const following = localStorage.getItem(this.FOLLOWING_KEY)
    const followingMap = following ? JSON.parse(following) : {}
    return followingMap[username] || []
  }

  getAllFollowing(): Record<string, string[]> {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem(this.FOLLOWING_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  getFollowers(username: string): string[] {
    const followers = localStorage.getItem(`fuscon_followers_${username}`)
    return followers ? JSON.parse(followers) : []
  }

  toggleFollow(follower: string, following: string): void {
    const users = this.getUsers()
    const followerUser = users.find((u) => u.username === follower)
    const followingUser = users.find((u) => u.username === following)

    if (followerUser && followingUser) {
      const isFollowing = followerUser.following.includes(following)

      if (isFollowing) {
        // Unfollow
        followerUser.following = followerUser.following.filter((u) => u !== following)
        followingUser.followers = followingUser.followers.filter((u) => u !== follower)
      } else {
        // Follow
        followerUser.following.push(following)
        followingUser.followers.push(follower)
      }

      this.saveUsers(users)
    }
  }

  isFollowing(follower: string, following: string): boolean {
    const user = this.getUser(follower)
    return user ? user.following.includes(following) : false
  }

  // Profile photos
  saveProfilePhoto(username: string, photoData: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(`fuscon_photo_${username}`, photoData)
    }
  }

  getProfilePhoto(username: string): string | null {
    return localStorage.getItem(`fuscon_photo_${username}`)
  }

  getAllProfilePhotos(): Record<string, string> {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem(this.PROFILE_PHOTOS_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  // Load default posts from JSON file
  loadDefaultPosts(): void {
    if (typeof window === "undefined") return

    const alreadyLoaded = localStorage.getItem(this.DEFAULT_POSTS_LOADED_KEY)
    if (alreadyLoaded) return

    const defaultPosts: Post[] = [
      {
        id: "1",
        username: "Alex Chen",
        content: "Just launched my new project! Excited to share it with everyone 🚀",
        timestamp: Date.now() - 3600000,
        likes: [],
        dislikes: [],
        comments: [
          {
            id: "c1",
            username: "Sarah Kim",
            content: "Congratulations! Can't wait to check it out!",
            timestamp: Date.now() - 3000000,
          },
        ],
      },
      {
        id: "2",
        username: "Maria Rodriguez",
        content: "Beautiful sunset today! Nature never fails to amaze me 🌅",
        timestamp: Date.now() - 7200000,
        likes: [],
        dislikes: [],
        comments: [],
      },
      {
        id: "3",
        username: "David Park",
        content: "Working on some exciting new features for our app. Stay tuned! 💻",
        timestamp: Date.now() - 10800000,
        likes: [],
        dislikes: [],
        comments: [
          {
            id: "c2",
            username: "Emma Wilson",
            content: "Looking forward to seeing what you've built!",
            timestamp: Date.now() - 9000000,
          },
        ],
      },
    ]

    // Only add if no posts exist
    const existingPosts = this.getPosts()
    if (existingPosts.length === 0) {
      this.savePosts(defaultPosts)
    }

    localStorage.setItem(this.DEFAULT_POSTS_LOADED_KEY, "true")
  }

  // Real-time call management
  saveActiveCall(callData: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.getStorageKey("active-call"), JSON.stringify(callData))
      window.dispatchEvent(new CustomEvent("callStateChanged", { detail: callData }))
    }
  }

  getActiveCall(): any | null {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(this.getStorageKey("active-call"))
    return stored ? JSON.parse(stored) : null
  }

  clearActiveCall(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.getStorageKey("active-call"))
      window.dispatchEvent(new CustomEvent("callStateChanged", { detail: null }))
    }
  }

  getCallHistory(username: string): CallRecord[] {
    const history = localStorage.getItem(`fuscon_calls_${username}`)
    return history ? JSON.parse(history) : []
  }

  addCallRecord(call: CallRecord): void {
    const history = this.getCallHistory(call.caller)
    history.unshift(call)
    localStorage.setItem(`fuscon_calls_${call.caller}`, JSON.stringify(history))

    // Also save for recipient
    const recipientHistory = this.getCallHistory(call.recipient)
    recipientHistory.unshift(call)
    localStorage.setItem(`fuscon_calls_${call.recipient}`, JSON.stringify(recipientHistory))
  }

  updateCallRecord(call: CallRecord): void {
    // Update for both caller and recipient
    ;[call.caller, call.recipient].forEach((username) => {
      const history = this.getCallHistory(username)
      const index = history.findIndex((c) => c.id === call.id)
      if (index > -1) {
        history[index] = call
        localStorage.setItem(`fuscon_calls_${username}`, JSON.stringify(history))
      }
    })
  }

  // Clear all data (for debugging)
  clearAllData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.USERS_KEY)
      localStorage.removeItem(this.POSTS_KEY)
      localStorage.removeItem(this.PROFILE_PHOTOS_KEY)
      localStorage.removeItem(this.FOLLOWING_KEY)
      localStorage.removeItem(this.DEFAULT_POSTS_LOADED_KEY)
      localStorage.removeItem(this.getStorageKey("current_user"))
      console.log("All Fuscon data cleared")
    }
  }
}

export const persistentStorage = new PersistentStorage()
