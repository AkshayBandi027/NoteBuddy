import { Suspense } from "react"
import { getNotes } from "../actions/notes"
import { SkeletonCard } from "@/components/skeleton-card"
import AddNote from "./add-note"
import Link from "next/link"

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
        <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-2">
          {notes.map(note => (
            <Link href={`/dashboard/notes/${note.id}`} key={note.id}>
              <div
                key={note.id}
                className="border-b-muted hover:bg-accent/30 flex h-40 w-72 cursor-pointer flex-col gap-2 overflow-hidden rounded-sm border-1 p-4 hover:shadow-md"
              >
                <h3 className="text-md font-bold tracking-wide">
                  {note.title || "Untitled"}
                </h3>

                <p
                  dangerouslySetInnerHTML={{
                    __html: note.description as string,
                  }}
                  className="text-sm font-normal"
                ></p>
              </div>
            </Link>
          ))}
        </div>
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
