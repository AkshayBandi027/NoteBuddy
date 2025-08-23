import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

if (typeof window === "undefined") {
  require("dotenv").config({ path: ".env.local" })
}

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) console.error(`DATABASE_URL doesn't exist`)

const sql = neon(dbUrl)
export const db = drizzle({ client: sql })
