import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { env } from "@/lib/env"
import { rateLimit } from "@/lib/rate-limit"

export const maxDuration = 30

const openrouter = createOpenRouter({
  apiKey: env.OPEN_ROUTER_API_KEY,
})

const bodySchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const limit = rateLimit(`completion:${session.user.id}`, 20, 60_000)

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
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const result = streamText({
    model: openrouter.chat(env.OPENROUTER_MODEL),
    messages: [
      {
        role: "system",
        content: `You are a helpful AI embedded in a notion text editor app that is used to autocomplete sentences.
                The traits of AI include expert knowledge, helpfulness, cleverness, and aritculateness.
                Ai is a well-behaved and well-mannered individual,
                AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtfull responses to the user.
                Don't ask the user to any additional questions.
                Don't repeat the user's question.
            `,
      },
      {
        role: "user",
        content: `I am writing a piece of text in a notion text editor app.
            Help me complete my train of thought here: ##${parsed.data.prompt}##
            Keep the tone of the text consistent with the rest of the text.
            keep the response short and sweet.`,
      },
    ],
  })

  return result.toTextStreamResponse()
}
