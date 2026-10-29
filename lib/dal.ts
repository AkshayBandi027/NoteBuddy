import "server-only"

import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { cache } from "react"
import { auth } from "./auth"


export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session || !session?.user) {
    return null
  }

  return {
    isAuthenticated: true as const,
    userId: session.user.id,
    user: session.user,
  }
})

export const verifySession = cache(async () => {
  const session = await getSession()

  if (!session) {
    unauthorized()
  }

  return session
})
