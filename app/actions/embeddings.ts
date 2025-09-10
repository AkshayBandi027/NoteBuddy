"use server"

import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

const contentSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
})

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_KEY || "",
})

export default async function generateEmbeddings(text: string) {
  const parsedContent = contentSchema.parse({ text })

  const response = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: [parsedContent.text],
    config: {
      outputDimensionality: 1536,
    }
  })

  return response.embeddings && response.embeddings[0].values
}
