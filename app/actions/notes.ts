"use server"

import { verifySession } from "@/lib/dal"
import { db } from "@/lib/db"
import { note } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect, unauthorized } from "next/navigation"

export const createNote = async () => {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // })

  // if (!session?.session || !session?.user) {
  //   unauthorized()
  // }

  const session = await verifySession()
  if (!session) {
    unauthorized()
  }

  const newNote = await db
    .insert(note)
    .values({
      userId: session.userId,
      title: "",
      description: "",
    })
    .returning({
      id: note.id,
    })  
  const noteId = newNote[0]?.id

  redirect(`/dashboard/notes/${noteId}`)
}

export const getNotes = async () => {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // })

  // if (!session?.session || !session?.user) {
  //   unauthorized()
  // }

  const session = await verifySession()
  if(!session) {
     unauthorized()
  }


  const notes = await db.query.note.findMany({
    where: eq(note.userId, session.userId),
  })

  return notes
}
