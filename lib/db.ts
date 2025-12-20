import { neon } from "@neondatabase/serverless"

let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.fusconn_DATABASE_URL
    if (!databaseUrl) {
      // Return a mock that won't fail at build time
      return null as any
    }
    sqlInstance = neon(databaseUrl)
  }
  return sqlInstance
}

export const sql = getSql
