import "server-only"

import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { env } from "./env"

const EMBEDDING_DIMENSIONS = 1536

const contentSchema = z.object({
  text: z.string().trim().min(1, "Text cannot be empty"),
})

const genAI = new GoogleGenAI({
  apiKey: env.GOOGLE_GENAI_KEY,
})

export default async function generateEmbeddings(
  text: string,
): Promise<number[]> {
  const { text: parsedText } = contentSchema.parse({ text })

  const response = await genAI.models.embedContent({
    model: env.EMBEDDING_MODEL,
    contents: [parsedText],
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  })

  const values = response.embeddings?.[0]?.values

  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Embedding provider returned an invalid embedding")
  }

  return values
}
