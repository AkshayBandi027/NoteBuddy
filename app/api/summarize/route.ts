import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { generateText } from "ai"
import { env } from "@/lib/env"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export const maxDuration = 30

const openRouter = createOpenRouter({
  apiKey: env.OPEN_ROUTER_API_KEY,
})
const bodySchema = z.object({
  content: z.string().trim().min(1).max(20_000),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const limit = rateLimit(`summarize:${session.user.id}`, 10, 60_000)

  if (!limit.success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000)),
        ),
      },
    })
  }

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const result = await generateText({ 
      model: openRouter.chat(env.OPENROUTER_MODEL),
      messages: [
        {
          role: "system",
          content: `You are helpful AI that summarizes text consicely.`,
        },
        {
          role: "user",
          content: `Summarize the following text in a concise manner ##${parsed.data.content}##`,
        },
      ],
    })

    return NextResponse.json({ summary: result.text.trim() })
  } catch (error) {
    console.error("Summarize failed", error)
    return NextResponse.json(
      { error: "Could not summarize this note. Please try again." },
      { status: 502 },
    )
  }
}
