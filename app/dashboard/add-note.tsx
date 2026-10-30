"use client"

import { useMutation } from "@tanstack/react-query"
import { Loader2Icon, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createNote } from "../actions/notes"

export default function AddNote() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: noteId => {
      router.push(`/dashboard/notes/${noteId}`)
      router.refresh()
    },
    onError: error => {
      console.error(`Error creating note: ${error}`)
    },
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  return (
    <Button variant="outline" onClick={onSubmit}>
      {mutation.isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          New Note
        </>
      )}
    </Button>
  )
}
