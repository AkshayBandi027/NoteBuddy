"use server"

import { and, cosineDistance, eq, lt, sql } from "drizzle-orm"
import { z } from "zod"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import { note } from "@/lib/db/schema"
import generateEmbeddings from "@/lib/embeddings"

const querySchema = z.string().trim().min(1).max(500)

// Cosine distance: 0 = identical, 2 = opposite. Keep only reasonably
// similar notes (similarity >= 0.4).
const MAX_COSINE_DISTANCE = 0.6

export const searchNotes = async (query: string) => {
  const session = await verifySession()

  const parsed = querySchema.safeParse(query)
  if (!parsed.success) return []

  const queryEmbeddings = await generateEmbeddings(parsed.data)
  const similarity = sql<number>`${cosineDistance(note.embeddings, queryEmbeddings)}`

  return db
    .select({
      id: note.id,
      title: note.title,
      contentText: note.contentText,
      similarity,
    })
    .from(note)
    .where(
      and(eq(note.userId, session.userId), lt(similarity, MAX_COSINE_DISTANCE)),
    )
    .orderBy(similarity)
    .limit(10)
}
