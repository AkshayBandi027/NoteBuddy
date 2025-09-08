"use server"

import { openai } from "@ai-sdk/openai"
import { embed } from "ai"
import { z } from "zod"

const textSchema = z.object({
  text: z.string().min(1, "Text is required"),
})

export default async function generateEmbeddings(text: string) {
  const model = openai.embedding("text-embedding-3-small")

  const parsedText = textSchema.parse(text)

  const { embedding } = await embed({
    model,
    value: parsedText.text,
  })

  return embedding
}
