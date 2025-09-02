import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { NextRequest } from "next/server"

export const maxDuration = 30

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const result = streamText({
    model: openrouter.chat("google/gemma-3-27b-it:free"),
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
            Help me complete my train of thought here: ##${prompt}##
            Keep the tone of the text consistent with the rest of the text.
            keep the response short and sweet.`,
      },
    ],
  })

  return result.toUIMessageStreamResponse()
}
