// Persistent storage utility for server-side API routes
// Uses in-memory storage that persists during server runtime

const storage = new Map<string, any>()

export const persistentStorage = {
  get: async (key: string) => {
    return storage.get(key) || null
  },

  set: async (key: string, value: any) => {
    storage.set(key, value)
    return value
  },

  delete: async (key: string) => {
    storage.delete(key)
  },

  keys: async (pattern?: string) => {
    const allKeys = Array.from(storage.keys())
    if (!pattern) return allKeys

    // Simple pattern matching (supports wildcards with *)
    const regex = new RegExp(pattern.replace(/\*/g, ".*"))
    return allKeys.filter((key) => regex.test(key))
  },

  getAll: async () => {
    return Array.from(storage.entries()).reduce(
      (acc, [key, value]) => {
        acc[key] = value
        return acc
      },
      {} as Record<string, any>,
    )
  },
}
