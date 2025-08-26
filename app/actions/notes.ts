"use server"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import { note } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { redirect, unauthorized } from "next/navigation"

export const createNote = async () => {
  const session = await verifySession()
  if (!session) {
    unauthorized()
  }

  const newNote = await db
    .insert(note)
    .values({
      userId: session.userId,
      title: null,
      description: null,
    })
    .returning({
      id: note.id,
    })
  const noteId = newNote[0]?.id

  redirect(`/dashboard/notes/${noteId}`)
}

export const getNotes = async () => {
  const session = await verifySession()
  if (!session) {
    unauthorized()
  }

  const notes = await db.query.note.findMany({
    where: eq(note.userId, session.userId),
  })

  return notes
}

export const getNoteById = async (noteId: string) => {
  const session = await verifySession()
  if (!session) {
    unauthorized()
  }

  const noteInfo = await db.query.note.findFirst({
    where: and(eq(note?.id, noteId), eq(note.userId, session.userId)),
  })

  return noteInfo
}

export const updateNoteById = async ({
  title,
  description,
  noteId,
}: {
  title: string
  description: string
  noteId: string
}) => {
  const session = await verifySession()
  if (!session) {
    unauthorized()
  }

  await db
    .update(note)
    .set({
      title,
      description,
    })
    .where(and(eq(note.userId, session.userId), eq(note.id, noteId)))
}

export const deleteNoteById = async (noteId: string) => {
  const session = await verifySession()

  if (!session) {
    unauthorized()
  }

  await db
    .delete(note)
    .where(and(eq(note.userId, session.userId), eq(note.id, noteId)))
}
