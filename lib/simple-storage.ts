// Simple in-memory storage that works in serverless
class SimpleStorage {
  private data: Map<string, any> = new Map()

  async get(key: string) {
    return this.data.get(key) || null
  }

  async set(key: string, value: any) {
    this.data.set(key, value)
    return value
  }

  async keys(pattern?: string) {
    const allKeys = Array.from(this.data.keys())
    if (pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'))
      return allKeys.filter(key => regex.test(key))
    }
    return allKeys
  }

  async delete(key: string) {
    this.data.delete(key)
  }
}

const storage = new SimpleStorage()

export { storage }
export default storage
