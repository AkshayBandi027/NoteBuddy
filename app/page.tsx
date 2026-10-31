import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/dal"
import { GalleryVerticalEnd, Sparkles, Search, FileText } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="text-lg font-semibold">NoteBuddy</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex max-w-3xl flex-col items-center gap-4">
          <div className="bg-primary/10 text-primary flex items-center gap-2 rounded-full px-4 py-1 text-sm">
            <Sparkles className="size-4" />
            <span>AI-Powered Note Taking</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your thoughts, amplified by AI
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
            Write, refine, and search your notes with intelligent autocomplete,
            one-click summarization, and semantic search powered by AI.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start taking notes</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border-border bg-card flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
            <FileText className="text-primary size-8" />
            <h3 className="text-lg font-semibold">Rich Text Editor</h3>
            <p className="text-muted-foreground text-sm">
              Write with a powerful Tiptap editor featuring all the formatting
              tools you need
            </p>
          </div>
          <div className="border-border bg-card flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
            <Sparkles className="text-primary size-8" />
            <h3 className="text-lg font-semibold">AI Assistance</h3>
            <p className="text-muted-foreground text-sm">
              Get intelligent autocomplete and instant summaries for your notes
            </p>
          </div>
          <div className="border-border bg-card flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
            <Search className="text-primary size-8" />
            <h3 className="text-lg font-semibold">Semantic Search</h3>
            <p className="text-muted-foreground text-sm">
              Find your notes by meaning, not just keywords with vector search
            </p>
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground p-6 text-center text-sm">
        <p>© {new Date().getFullYear()} NoteBuddy. Built with Next.js, AI, and
          pgvector.</p>
      </footer>
    </div>
  )
}
