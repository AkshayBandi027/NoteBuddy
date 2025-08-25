"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const signOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      NoteBuddy Ai Powered Note taking application !
      <Button onClick={signOut}>Log out</Button>
    </div>
  )
}
