import { neon } from "@neondatabase/serverless"

let sqlInstance: any = null

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.fusconn_DATABASE_URL
    if (!databaseUrl) {
      return null
    }
    sqlInstance = neon(databaseUrl)
  }
  return sqlInstance
}

export interface User {
  id: string
  username: string
  password: string
  bio?: string
  photoUrl?: string
  backgroundUrl?: string
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundBrightness?: number
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

export interface MarketplaceListing {
  id: string
  seller: string
  title: string
  description: string
  price: number
  imageUrl?: string
  createdAt: number
}

export interface Pet {
  id: string
  owner: string
  name: string
  type: string
  hunger: number
  happiness: number
  level: number
  experience: number
  createdAt: number
}

export interface Call {
  id: string
  caller: string
  recipient: string
  callType: string
  duration: number
  createdAt: number
}

export interface Chat {
  id: string
  user1: string
  user2: string
  createdAt: number
  messages: Message[]
}

export interface Message {
  id: string
  chatId: string
  sender: string
  content: string
  createdAt: number
}

const safeQuery = async (fn: () => Promise<any>) => {
  try {
    const sql = getSql()
    if (!sql) return []
    return await fn()
  } catch (error: any) {
    console.error("[v0] Query error:", error.message)
    return []
  }
}

export const storage = {
  users: {
    get: async (username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return null
        const rows = await sql`SELECT * FROM users WHERE username = ${username}`
        if (rows.length === 0) return null
        const row = rows[0]
        return {
          id: row.id,
          username: row.username,
          password: row.password,
          bio: row.bio,
          photoUrl: row.photo_url,
          backgroundUrl: row.background_url,
          backgroundBlur: row.background_blur,
          backgroundOpacity: row.background_opacity,
          backgroundBrightness: row.background_brightness,
          createdAt: Number(row.created_at),
        }
      })
    },
    set: async (username: string, user: User) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO users (id, username, password, bio, photo_url, background_url, background_blur, background_opacity, background_brightness, created_at)
          VALUES (${user.id}, ${user.username}, ${user.password}, ${user.bio || null}, ${user.photoUrl || null}, ${user.backgroundUrl || null}, ${user.backgroundBlur || 0}, ${user.backgroundOpacity || 100}, ${user.backgroundBrightness || 100}, ${user.createdAt})
          ON CONFLICT (username) DO UPDATE SET
            bio = ${user.bio || null},
            photo_url = ${user.photoUrl || null},
            background_url = ${user.backgroundUrl || null},
            background_blur = ${user.backgroundBlur || 0},
            background_opacity = ${user.backgroundOpacity || 100},
            background_brightness = ${user.backgroundBrightness || 100}
        `
      })
    },
    getAll: async () => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT * FROM users ORDER BY created_at DESC`
        return rows.map((row: any) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          bio: row.bio,
          photoUrl: row.photo_url,
          backgroundUrl: row.background_url,
          backgroundBlur: row.background_blur,
          backgroundOpacity: row.background_opacity,
          backgroundBrightness: row.background_brightness,
          createdAt: Number(row.created_at),
        }))
      })
    },
  },

  posts: {
    getAll: async () => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`
        const posts = []
        for (const row of rows) {
          const likes = await sql`SELECT username FROM post_likes WHERE post_id = ${row.id}`
          const dislikes = await sql`SELECT username FROM post_dislikes WHERE post_id = ${row.id}`
          const commentRows = await sql`SELECT * FROM comments WHERE post_id = ${row.id} ORDER BY created_at ASC`
          posts.push({
            id: row.id,
            username: row.username,
            content: row.content,
            imageUrl: row.image_url,
            videoUrl: row.video_url,
            gifUrl: row.gif_url,
            createdAt: Number(row.created_at),
            likes: likes.map((l: any) => l.username),
            dislikes: dislikes.map((d: any) => d.username),
            comments: commentRows.map((c: any) => ({
              id: c.id,
              username: c.username,
              content: c.content,
              createdAt: Number(c.created_at),
            })),
          })
        }
        return posts
      })
    },
    set: async (id: string, post: Post) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO posts (id, username, content, image_url, video_url, gif_url, created_at)
          VALUES (${id}, ${post.username}, ${post.content}, ${post.imageUrl || null}, ${post.videoUrl || null}, ${post.gifUrl || null}, ${post.createdAt})
          ON CONFLICT (id) DO UPDATE SET
            content = ${post.content},
            image_url = ${post.imageUrl || null},
            video_url = ${post.videoUrl || null},
            gif_url = ${post.gifUrl || null}
        `
      })
    },
    addComment: async (postId: string, comment: Comment) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO comments (id, post_id, username, content, created_at)
          VALUES (${comment.id}, ${postId}, ${comment.username}, ${comment.content}, ${comment.createdAt})
        `
      })
    },
    like: async (postId: string, username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`INSERT INTO post_likes (post_id, username) VALUES (${postId}, ${username}) ON CONFLICT DO NOTHING`
        await sql`DELETE FROM post_dislikes WHERE post_id = ${postId} AND username = ${username}`
      })
    },
    dislike: async (postId: string, username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`INSERT INTO post_dislikes (post_id, username) VALUES (${postId}, ${username}) ON CONFLICT DO NOTHING`
        await sql`DELETE FROM post_likes WHERE post_id = ${postId} AND username = ${username}`
      })
    },
  },

  communities: {
    getAll: async () => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT * FROM communities ORDER BY created_at DESC`
        const communities = []
        for (const row of rows) {
          const members = await sql`SELECT username FROM community_members WHERE community_id = ${row.id}`
          communities.push({
            id: row.id,
            name: row.name,
            description: row.description,
            creator: row.creator,
            members: members.map((m: any) => m.username),
            createdAt: Number(row.created_at),
          })
        }
        return communities
      })
    },
    set: async (id: string, community: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO communities (id, name, description, creator, created_at)
          VALUES (${id}, ${community.name}, ${community.description}, ${community.creator}, ${community.createdAt})
          ON CONFLICT (id) DO NOTHING
        `
      })
    },
    join: async (communityId: string, username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`INSERT INTO community_members (community_id, username) VALUES (${communityId}, ${username}) ON CONFLICT DO NOTHING`
      })
    },
    getPosts: async (communityId: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows =
          await sql`SELECT * FROM community_posts WHERE community_id = ${communityId} ORDER BY created_at DESC`
        const posts = []
        for (const row of rows) {
          const votes = await sql`SELECT username, vote_type FROM community_post_votes WHERE post_id = ${row.id}`
          posts.push({
            id: row.id,
            communityId: row.community_id,
            username: row.username,
            content: row.content,
            createdAt: Number(row.created_at),
            upvotes: votes.filter((v: any) => v.vote_type === "up").map((v: any) => v.username),
            downvotes: votes.filter((v: any) => v.vote_type === "down").map((v: any) => v.username),
          })
        }
        return posts
      })
    },
    addPost: async (post: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO community_posts (id, community_id, username, content, created_at)
          VALUES (${post.id}, ${post.communityId}, ${post.username}, ${post.content}, ${post.createdAt})
        `
      })
    },
    vote: async (postId: string, username: string, voteType: "up" | "down") => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO community_post_votes (post_id, username, vote_type)
          VALUES (${postId}, ${username}, ${voteType})
          ON CONFLICT (post_id, username) DO UPDATE SET vote_type = ${voteType}
        `
      })
    },
  },

  marketplace: {
    getAll: async () => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT * FROM marketplace_listings ORDER BY created_at DESC`
        return rows.map((row: any) => ({
          id: row.id,
          seller: row.seller,
          title: row.title,
          description: row.description,
          price: Number(row.price),
          imageUrl: row.image_url,
          createdAt: Number(row.created_at),
        }))
      })
    },
    add: async (listing: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO marketplace_listings (id, seller, title, description, price, image_url, created_at)
          VALUES (${listing.id}, ${listing.seller}, ${listing.title}, ${listing.description}, ${listing.price}, ${listing.imageUrl || null}, ${listing.createdAt})
        `
      })
    },
  },

  pets: {
    getByOwner: async (owner: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT * FROM virtual_pets WHERE owner = ${owner} ORDER BY created_at DESC`
        return rows.map((row: any) => ({
          id: row.id,
          owner: row.owner,
          name: row.name,
          type: row.type,
          hunger: row.hunger,
          happiness: row.happiness,
          level: row.level,
          experience: row.experience,
          createdAt: Number(row.created_at),
        }))
      })
    },
    add: async (pet: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO virtual_pets (id, owner, name, type, hunger, happiness, level, experience, created_at)
          VALUES (${pet.id}, ${pet.owner}, ${pet.name}, ${pet.type}, ${pet.hunger}, ${pet.happiness}, ${pet.level}, ${pet.experience}, ${pet.createdAt})
        `
      })
    },
    update: async (petId: string, updates: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          UPDATE virtual_pets
          SET hunger = ${updates.hunger}, happiness = ${updates.happiness}, level = ${updates.level}, experience = ${updates.experience}
          WHERE id = ${petId}
        `
      })
    },
    get: async (petId: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return null
        const rows = await sql`SELECT * FROM virtual_pets WHERE id = ${petId}`
        if (rows.length === 0) return null
        const row = rows[0]
        return {
          id: row.id,
          owner: row.owner,
          name: row.name,
          type: row.type,
          hunger: row.hunger,
          happiness: row.happiness,
          level: row.level,
          experience: row.experience,
          createdAt: Number(row.created_at),
        }
      })
    },
  },

  calls: {
    getByUser: async (username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`
          SELECT * FROM call_history 
          WHERE caller = ${username} OR recipient = ${username}
          ORDER BY created_at DESC
        `
        return rows.map((row: any) => ({
          id: row.id,
          caller: row.caller,
          recipient: row.recipient,
          callType: row.call_type,
          duration: row.duration,
          createdAt: Number(row.created_at),
        }))
      })
    },
    add: async (call: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO call_history (id, caller, recipient, call_type, duration, created_at)
          VALUES (${call.id}, ${call.caller}, ${call.recipient}, ${call.callType}, ${call.duration || 0}, ${call.createdAt})
        `
      })
    },
  },

  chats: {
    getByUser: async (username: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`
          SELECT * FROM chats 
          WHERE user1 = ${username} OR user2 = ${username}
          ORDER BY created_at DESC
        `
        const chats = []
        for (const row of rows) {
          const messages = await sql`SELECT * FROM messages WHERE chat_id = ${row.id} ORDER BY created_at ASC`
          chats.push({
            id: row.id,
            user1: row.user1,
            user2: row.user2,
            createdAt: Number(row.created_at),
            messages: messages.map((m: any) => ({
              id: m.id,
              sender: m.sender,
              content: m.content,
              createdAt: Number(m.created_at),
            })),
          })
        }
        return chats
      })
    },
    create: async (chat: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO chats (id, user1, user2, created_at)
          VALUES (${chat.id}, ${chat.user1}, ${chat.user2}, ${chat.createdAt})
        `
      })
    },
    addMessage: async (chatId: string, message: any) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO messages (id, chat_id, sender, content, created_at)
          VALUES (${message.id}, ${chatId}, ${message.sender}, ${message.content}, ${message.createdAt})
        `
      })
    },
    get: async (chatId: string) => {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return null
        const rows = await sql`SELECT * FROM chats WHERE id = ${chatId}`
        if (rows.length === 0) return null
        const row = rows[0]
        const messages = await sql`SELECT * FROM messages WHERE chat_id = ${chatId} ORDER BY created_at ASC`
        return {
          id: row.id,
          user1: row.user1,
          user2: row.user2,
          createdAt: Number(row.created_at),
          messages: messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            createdAt: Number(m.created_at),
          })),
        }
      })
    },
  },
}

export const kv = {
  get: async (key: string) => {
    if (key.startsWith("videos:")) {
      const videoId = key.replace("videos:", "")
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return null
        const rows = await sql`SELECT * FROM videos WHERE id = ${videoId}`
        if (rows.length === 0) return null
        const row = rows[0]
        const likes = await sql`SELECT username FROM video_likes WHERE video_id = ${videoId}`
        const commentRows = await sql`SELECT * FROM video_comments WHERE video_id = ${videoId} ORDER BY created_at ASC`
        return {
          id: row.id,
          username: row.username,
          title: row.title,
          description: row.description,
          videoUrl: row.video_url,
          thumbnailUrl: row.thumbnail_url,
          createdAt: Number(row.created_at),
          likes: likes.map((l: any) => l.username),
          comments: commentRows.map((c: any) => ({
            id: c.id,
            username: c.username,
            content: c.content,
            createdAt: Number(c.created_at),
          })),
        }
      })
    }
    return null
  },
  set: async (key: string, value: any) => {
    if (key.startsWith("videos:")) {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return
        await sql`
          INSERT INTO videos (id, username, title, description, video_url, thumbnail_url, created_at)
          VALUES (${value.id}, ${value.username}, ${value.title}, ${value.description || null}, ${value.videoUrl}, ${value.thumbnailUrl || null}, ${value.createdAt})
          ON CONFLICT (id) DO NOTHING
        `
      })
    }
  },
  keys: async (pattern: string) => {
    if (pattern.startsWith("videos:")) {
      return safeQuery(async () => {
        const sql = getSql()
        if (!sql) return []
        const rows = await sql`SELECT id FROM videos ORDER BY created_at DESC`
        return rows.map((r: any) => `videos:${r.id}`)
      })
    }
    return []
  },
  like: async (videoId: string, username: string) => {
    return safeQuery(async () => {
      const sql = getSql()
      if (!sql) return
      await sql`INSERT INTO video_likes (video_id, username) VALUES (${videoId}, ${username}) ON CONFLICT DO NOTHING`
    })
  },
  addComment: async (videoId: string, comment: any) => {
    return safeQuery(async () => {
      const sql = getSql()
      if (!sql) return
      await sql`
        INSERT INTO video_comments (id, video_id, username, content, created_at)
        VALUES (${comment.id}, ${videoId}, ${comment.username}, ${comment.content}, ${comment.createdAt})
      `
    })
  },
}

export const webrtcStorage = {
  saveSignal: async (recipient: string, signalData: any) => {
    return safeQuery(async () => {
      const sql = getSql()
      if (!sql) return
      await sql`
        INSERT INTO webrtc_signals (id, recipient, sender, signal_data, signal_type, created_at)
        VALUES (${`signal-${Date.now()}-${Math.random()}`}, ${recipient}, ${signalData.from}, ${JSON.stringify(signalData.signal)}, ${signalData.type}, ${Date.now()})
      `
    })
  },
  getSignals: async (username: string) => {
    return safeQuery(async () => {
      const sql = getSql()
      if (!sql) return []
      const rows = await sql`SELECT * FROM webrtc_signals WHERE recipient = ${username} ORDER BY created_at ASC`
      return rows.map((row: any) => ({
        from: row.sender,
        to: row.recipient,
        signal: JSON.parse(row.signal_data),
        type: row.signal_type,
        timestamp: Number(row.created_at),
      }))
    })
  },
  clearSignals: async (username: string) => {
    return safeQuery(async () => {
      const sql = getSql()
      if (!sql) return
      await sql`DELETE FROM webrtc_signals WHERE recipient = ${username}`
    })
  },
}
