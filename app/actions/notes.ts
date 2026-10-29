"use server"

import { revalidatePath } from "next/cache"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import { note } from "@/lib/db/schema"
import generateEmbeddings from "@/lib/embeddings"

const noteIdSchema = z.uuid()
const titleSchema = z.string().trim().max(200)
const contentTextSchema = z.string().max(200_000)

const updateTitleSchema = z.object({
  noteId: noteIdSchema,
  title: titleSchema,
})

const updateContentSchema = z.object({
  noteId: noteIdSchema,
  content: z.unknown(),
  contentText: contentTextSchema,
})

const noteIdOnlySchema = z.object({
  noteId: noteIdSchema,
})

export const createNote = async () => {
  const session = await verifySession()

  const newNote = await db
    .insert(note)
    .values({
      userId: session.userId,
      title: "Untitled",
      description: null,
      contentText: "",
    })
    .returning({ id: note.id })

  const noteId = newNote[0]?.id

  if (!noteId) {
    throw new Error("Failed to create note")
  }

  revalidatePath("/dashboard")

  return noteId
}

export const getNotes = async () => {
  const session = await verifySession()

  return db
    .select({
      id: note.id,
      title: note.title,
      contentText: note.contentText,
      updatedAt: note.updatedAt,
    })
    .from(note)
    .where(eq(note.userId, session.userId))
    .orderBy(desc(note.updatedAt))
}

export const getNoteById = async (noteId: string) => {
  const session = await verifySession()
  const parsedNoteId = noteIdSchema.parse(noteId)

  return db.query.note.findFirst({
    where: and(eq(note.id, parsedNoteId), eq(note.userId, session.userId)),
    columns: {
      id: true,
      title: true,
      description: true,
      contentText: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export const updateNoteTitle = async ({
  noteId,
  title,
}: {
  noteId: string
  title: string
}) => {
  const session = await verifySession()
  const parsed = updateTitleSchema.parse({ noteId, title })

  await db
    .update(note)
    .set({
      title: parsed.title || "Untitled",
      updatedAt: new Date(),
    })
    .where(and(eq(note.id, parsed.noteId), eq(note.userId, session.userId)))

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/notes/${parsed.noteId}`)
}


export const updateNoteContent = async ({
  noteId,
  content,
  contentText,
}: {
  noteId: string
  content: unknown
  contentText: string
}) => {
  const session = await verifySession()
  const parsed = updateContentSchema.parse({ noteId, content, contentText })

  await db
    .update(note)
    .set({
      description: parsed.content,
      contentText: parsed.contentText,
      updatedAt: new Date(),
    })
    .where(and(eq(note.id, parsed.noteId), eq(note.userId, session.userId)))
}


export const updateNoteEmbedding = async ({ noteId }: { noteId: string }) => {
  const session = await verifySession()
  const parsed = noteIdOnlySchema.parse({ noteId })

  const existing = await db.query.note.findFirst({
    where: and(eq(note.id, parsed.noteId), eq(note.userId, session.userId)),
    columns: { contentText: true },
  })

  if (!existing) {
    return { ok: false as const, reason: "not_found" as const }
  }

  const text = existing.contentText?.trim()

  if (!text) {
    await db
      .update(note)
      .set({ embeddings: null })
      .where(and(eq(note.id, parsed.noteId), eq(note.userId, session.userId)))

    return { ok: true as const }
  }

  try {
    const embeddings = await generateEmbeddings(text)

    await db
      .update(note)
      .set({ embeddings })
      .where(and(eq(note.id, parsed.noteId), eq(note.userId, session.userId)))

    return { ok: true as const }
  } catch (error) {
    console.error(`Failed to embed note ${parsed.noteId}`, error)
    return { ok: false as const, reason: "embedding_failed" as const }
  }
}

export const deleteNoteById = async (noteId: string) => {
  const session = await verifySession()
  const parsedNoteId = noteIdSchema.parse(noteId)

  await db
    .delete(note)
    .where(and(eq(note.id, parsedNoteId), eq(note.userId, session.userId)))

  revalidatePath("/dashboard")
}
