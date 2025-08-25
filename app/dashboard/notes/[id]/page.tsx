"use client"
import { useParams } from "next/navigation"

export default function NotePage() {
  const params = useParams()
  return <h1>Note Page {params.id}</h1>
}
