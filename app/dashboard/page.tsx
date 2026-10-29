import Link from "next/link"
import { Suspense } from "react"

import { getNotes } from "../actions/notes"
import { SkeletonCard } from "@/components/skeleton-card"
import AddNote from "./add-note"

export default async function Page() {
  const notes = await getNotes()

  return (
    <main className="flex h-full min-w-full flex-col">
      <div className="flex min-w-full items-center justify-between p-4">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-lg font-semibold">My Notes</h2>
          <span className="block text-xs">({notes.length})</span>
        </div>

        <AddNote />
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
            <h3 className="text-lg font-semibold">No notes yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first note to get started.
            </p>
            <AddNote />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-2">
            {notes.map(note => (
              <Link href={`/dashboard/notes/${note.id}`} key={note.id}>
                <div className="border-b-muted hover:bg-accent/30 flex h-40 w-72 cursor-pointer flex-col gap-2 overflow-hidden rounded-sm border-1 p-4 hover:shadow-md">
                  <h3 className="text-md font-bold tracking-wide">
                    {note.title || "Untitled"}
                  </h3>

                  <p className="text-muted-foreground line-clamp-4 text-sm font-normal whitespace-pre-wrap">
                    {note.contentText?.trim() || "No content yet"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Suspense>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-2">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="border-b-muted hover:bg-accent/30 cursor-pointer rounded-xs border-1 p-4 hover:shadow-md"
        >
          <SkeletonCard />
        </div>
      ))}
    </div>
  )
}
