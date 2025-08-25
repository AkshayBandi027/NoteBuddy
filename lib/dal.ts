"server-only"

import { headers } from "next/headers"
import { unauthorized } from "next/navigation"
import { cache } from "react"
import { auth } from "./auth"

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session || !session?.user) {
    unauthorized()
  }

  return { isAuthenticated: true, userId: session.user.id }
})
