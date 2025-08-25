"use client"

import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { Loader2Icon, Plus } from "lucide-react"
import { createNote } from "../actions/notes"

export default function AddNote() {
  const mutation = useMutation({
    mutationFn: async () => {
      const noteId = await createNote()
      return noteId
    },
    onSuccess: noteId => {
      console.log(`Note created successfully`)
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
