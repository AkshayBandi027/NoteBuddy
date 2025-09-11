"use server"
import { db } from "@/lib/db"
import generateEmbeddings from "./embeddings"
import { note } from "@/lib/db/schema"
import { sql, and, cosineDistance, lt } from "drizzle-orm"

export const searchNotes = async (query: string) => {
  if (!query) return

  const queryEmbeddings = await generateEmbeddings(query)

  const similarity = sql<number>`${cosineDistance(note.embeddings, queryEmbeddings!)}`

  const results = await db
    .select({
      id: note.id,
      title: note.title,
      description: note.description,
      similarity,
    })
    .from(note)
    .where(lt(similarity, 0.3))
    .orderBy(similarity)
    .limit(10)

  return results
}
