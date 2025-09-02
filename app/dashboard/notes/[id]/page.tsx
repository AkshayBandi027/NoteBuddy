import { getNoteById } from "@/app/actions/notes"
import RichTextEditor from "@/components/text-editor"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { JSONContent } from "@tiptap/react"

interface Params {
  id: string
}

export default async function NotePage({ params }: { params: Params }) {
  const noteId = (await params).id as string
  const note = await getNoteById(noteId)

  const jsonDescription = note?.description as JSONContent[]

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="max-w-3xl flex-1 flex flex-col">
        <Suspense fallback={<Loading />}>
          <RichTextEditor noteId={noteId} content={jsonDescription} />
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
