"use client"

import { searchNotes } from "@/app/actions/search"
import { useDebounce } from "@/hooks/use-debounce"
import { Command } from "cmdk"
import { useEffect, useState } from "react"

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const debouncedValue = useDebounce(searchTerm, 1000)
  const [isLoading, setIsLoading] = useState(false)

  const getSearchResults = async (term: string) => {
    const similarNotes = await searchNotes(term)
    console.log("similarNotes --", similarNotes)
    return similarNotes
  }

  console.log(`searchResults --`, searchResults)

  useEffect(() => {
    if (!debouncedValue) return
    ;(async () => {
      setIsLoading(true)
      const results = (await getSearchResults(debouncedValue)) || []
      setSearchResults(results)
    })()
    setIsLoading(false)
  }, [debouncedValue])

  console.log(searchResults)

  return (
    <div>
      <Command className="absolute top-1 left-60 z-10 min-w-[400px] rounded-md bg-black/80 p-2">
        <Command.Input
          placeholder="Search..."
          value={searchTerm}
          onValueChange={text => setSearchTerm(text)}
          className="w-full border-0 bg-transparent outline-none placeholder:text-white/50 focus:ring-0"
        />
        <Command.List className="max-h-60 overflow-y-auto">
          {isLoading && <Command.Loading>Fetching words…</Command.Loading>}
          {searchResults?.map(item => {
            return (
              <Command.Item
                key={`${item.description}`}
                value={item}
                className="h-full w-[300px] rounded-xs bg-black/80 p-2 text-white"
              >
                {item.title}
              </Command.Item>
            )
          })}
        </Command.List>
      </Command>
    </div>
  )
}
