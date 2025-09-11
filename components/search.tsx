"use client"

import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import generateEmbeddings from "@/app/actions/embeddings"
import { searchNotes } from "@/app/actions/search"

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const debouncedValue = useDebounce(searchTerm, 800)

  const getSearchResults = async (term: string) => {
    const similarNotes = await searchNotes(term)
    console.log("similarNotes --", similarNotes)
    return similarNotes
  }

  useEffect(() => {
    if (!debouncedValue) return
    getSearchResults(debouncedValue)
  }, [debouncedValue])

  return (
    <div>
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
