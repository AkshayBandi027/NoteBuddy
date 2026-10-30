"use client"

import { Command } from "cmdk"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { searchNotes } from "@/app/actions/search"
import { useDebounce } from "@/hooks/use-debounce"

type SearchResult = Awaited<ReturnType<typeof searchNotes>>[number]

export default function Search() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedValue = useDebounce(searchTerm, 400)

  useEffect(() => {
    const term = debouncedValue.trim()

    if (!term) {
      setSearchResults([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    searchNotes(term)
      .then(results => {
        if (!cancelled) setSearchResults(results)
      })
      .catch(error => {
        console.error("Search failed", error)
        if (!cancelled) setSearchResults([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedValue])

  return (
    <div>
      <Command
        shouldFilter={false}
        className="bg-background/95 absolute top-1 left-60 z-10 min-w-[400px] rounded-md border p-2 shadow-md"
      >
        <Command.Input
          placeholder="Search notes..."
          value={searchTerm}
          onValueChange={text => setSearchTerm(text)}
          className="placeholder:text-muted-foreground w-full border-0 bg-transparent outline-none focus:ring-0"
        />
        <Command.List className="max-h-60 overflow-y-auto">
          {isLoading && <Command.Loading>Searching…</Command.Loading>}
          {!isLoading && searchTerm.trim() && searchResults.length === 0 && (
            <Command.Empty className="text-muted-foreground py-2 text-sm">
              No notes found.
            </Command.Empty>
          )}
          {searchResults.map(item => (
            <Command.Item
              key={item.id}
              value={item.id}
              onSelect={() => {
                router.push(`/dashboard/notes/${item.id}`)
                setSearchTerm("")
              }}
              className="hover:bg-accent aria-selected:bg-accent flex cursor-pointer flex-col gap-0.5 rounded-sm p-2"
            >
              <span className="text-sm font-medium">
                {item.title || "Untitled"}
              </span>
              {item.contentText && (
                <span className="text-muted-foreground line-clamp-1 text-xs">
                  {item.contentText}
                </span>
              )}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
