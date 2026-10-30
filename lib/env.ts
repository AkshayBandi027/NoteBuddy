import "server-only"
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  GOOGLE_GENAI_KEY: z.string().min(1, "GOOGLE_GENAI_KEY is required"),
  OPEN_ROUTER_API_KEY: z.string().min(1, "OPEN_ROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default("google/gemma-3-27b-it:free"),
  EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map(issue => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n")

  throw new Error(`Invalid environment variables:\n${issues}`)
}

export const env = parsed.data

export const isGoogleAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
)
