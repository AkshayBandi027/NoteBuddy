import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db } from "../db"
import { env, isGoogleAuthEnabled } from "../env"

const trustedOrigins = Array.from(
  new Set([
    env.BETTER_AUTH_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
  ]),
)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: isGoogleAuthEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  plugins: [nextCookies()],
  trustedOrigins,
  basePath: "/api/auth",
})

export { isGoogleAuthEnabled }
