"use client"

import { getNoteById, updateNoteById } from "@/app/actions/notes"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { queryClient } from "@/lib/providers"
import { debounce } from "@/lib/utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { ThemeToggler } from "./theme-toggler"
import { Input } from "./ui/input"

export function SiteHeader() {
  const pathname = usePathname()
  const params = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const noteId = params?.id as string
  const isNotePage = pathname?.includes("/dashboard/notes/")

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId) return null
      const res = await getNoteById(noteId)
      return res
    },
    enabled: !!noteId && isNotePage,
  })

  const mutation = useMutation({
    mutationFn: updateNoteById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] })
      setIsEditing(false)
    },
  })

  const debounceUpdate = useCallback(
    debounce(async (title: string) => {
      if (!noteId || !note) return

      mutation.mutate({
        title,
        description: note.description as string,
        noteId,
        embeddings: note.embeddings,
      })
    }, 800),
    [noteId, note?.description, note?.embeddings, mutation.mutate],
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setNoteTitle(newTitle)

    if (newTitle.trim() && newTitle !== note?.title) {
      debounceUpdate(newTitle)
    }
  }

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (!noteTitle.trim() && note?.title) {
      setNoteTitle(note.title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      inputRef.current?.blur()
    } else if (e.key === "Escape") {
      if (note?.title) {
        setNoteTitle(note.title)
      }
      setIsEditing(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (note?.title && !isEditing) {
      setNoteTitle(note.title)
    }
  }, [note?.title, isEditing])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setIsEditing(false)
    setNoteTitle("")
  }, [noteId])

  const renderTitle = () => {
    if (pathname === "/dashboard") {
      return <h1 className="text-lg font-semibold">Dashboard</h1>
    }

    if (isEditing) {
      return (
        <Input
          ref={inputRef}
          className="h-auto max-w-40 border-none p-2 text-lg font-semibold shadow-none focus-visible:ring-0"
          placeholder={note?.title || "Untitled"}
          onChange={handleTitleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          value={noteTitle}
        />
      )
    }

    return (
      <h1
        className="hover:text-muted-foreground cursor-pointer text-lg font-semibold transition-colors"
        onClick={handleClick}
      >
        {noteTitle || note?.title || "Untitled"}
      </h1>
    )
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="min-w-0 flex-1">{renderTitle()}</div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggler />
        </div>
      </div>
    </header>
  )
}
