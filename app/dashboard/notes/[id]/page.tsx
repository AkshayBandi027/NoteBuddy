import { getNoteById } from "@/app/actions/notes"
import RichTextEditor from "@/components/text-editor"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { JSONContent } from "@tiptap/react"

interface Params {
  id: string
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id: noteId } = await params
  const note = await getNoteById(noteId)

  if (!note) {
    notFound()
  }

  const content = note.description as JSONContent | string | null

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex max-w-3xl flex-1 flex-col">
        <Suspense fallback={<Loading />}>
          <RichTextEditor noteId={noteId} content={content ?? undefined} />
        </Suspense>
      </div>
    </div>
  )
}

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  )
}
