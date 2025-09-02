import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

const openRouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
  const { content } = await req.json()

  const result = await generateText({
    model: openRouter.chat("google/gemma-3-27b-it:free"),
    messages: [
      {
        role: "system",
        content: `You are helpful AI that summarizes text consicely.`,
      },
      {
        role: "user",
        content: `Summarize the following text in a concise manner ##${content}##`,
      },
    ],
  })

  const summary = await result.text
  return NextResponse.json({ summary })
}
