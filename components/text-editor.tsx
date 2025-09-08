"use client"

import generateEmbeddings from "@/app/actions/embeddings"
import { updateNoteById } from "@/app/actions/notes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { debounce } from "@/lib/utils"
import { useCompletion } from "@ai-sdk/react"
import { Extension } from "@tiptap/core"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  ChevronDown,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface RichTextEditorProps {
  content?: JSONContent[]
  noteId?: string
}

const debounceUpdate = debounce((content: string, noteId: string) => {
  generateEmbeddings(content)
  updateNoteById({ title: "", description: content, noteId: noteId! })
}, 500)

const RichTextEditor = ({ content, noteId }: RichTextEditorProps) => {
  const [summary, setSummary] = useState("")
  const { complete, completion } = useCompletion({
    api: `http://localhost:3000/api/completion`,
  })

  const customShortcuts = Extension.create({
    name: "customShortCuts",
    addKeyboardShortcuts() {
      return {
        "Mod-Shift-K": () => {
          const prompt = this.editor?.getText().split(" ").slice(-30).join(" ")
          complete(prompt)
          return true
        },
      }
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      customShortcuts,
    ],
    immediatelyRender: false,
    autofocus: true,
    editable: true,
    injectCSS: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      if (noteId) {
        debounceUpdate(content, noteId)
      }
    },
    content: content ?? {
      type: "doc",
      content: [],
    },
  })

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) return {}
      return {
        isBold: ctx.editor?.isActive("bold"),
        canBold: ctx.editor?.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor?.isActive("italic"),
        canItalic: ctx.editor?.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor?.isActive("strike"),
        canStrike: ctx.editor?.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor?.isActive("code"),
        canCode: ctx.editor?.can().chain().focus().toggleCode().run(),
        isParagraph: ctx.editor?.isActive("paragraph"),
        canParagraph: ctx.editor?.can().chain().focus().setParagraph().run(),
        isHeading1: ctx.editor?.isActive("heading", { level: 1 }),
        canHeading1: ctx.editor
          ?.can()
          .chain()
          .focus()
          .setHeading({ level: 1 })
          .run(),
        isHeading2: ctx.editor?.isActive("heading", { level: 2 }),
        canHeading2: ctx.editor
          ?.can()
          .chain()
          .focus()
          .setHeading({ level: 2 })
          .run(),
        isHeading3: ctx.editor?.isActive("heading", { level: 3 }),
        canHeading3: ctx.editor
          ?.can()
          .chain()
          .focus()
          .setHeading({ level: 3 })
          .run(),
        isBulletList: ctx.editor?.isActive("bulletList"),
        canBulletList: ctx.editor
          ?.can()
          .chain()
          .focus()
          .toggleBulletList()
          .run(),
        isOrderedList: ctx.editor?.isActive("orderedList"),
        canOrderedList: ctx.editor
          ?.can()
          .chain()
          .focus()
          .toggleOrderedList()
          .run(),
        isCodeBlock: ctx.editor?.isActive("codeBlock"),
        isBlockquote: ctx.editor?.isActive("blockquote"),
        canUndo: ctx.editor?.can().chain().focus().undo().run(),
        canRedo: ctx.editor?.can().chain().focus().redo().run(),
      }
    },
  })

  const getActiveHeading = () => {
    if (editorState?.isHeading1) return "H1"
    if (editorState?.isHeading2) return "H2"
    if (editorState?.isHeading3) return "H3"
    if (editorState?.isParagraph) return "P"
    return "P"
  }

  const getButtonClass = (isActive: boolean) => {
    return `size-8 p-0 transition-colors ${
      isActive
        ? "bg-blue-800 text-white hover:bg-blue-700"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`
  }

  const summarize = async () => {
    const content = editor?.getText()

    const result = await fetch(`/api/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    })
    const response = await result.json()
    setSummary(response.summary)
  }

  const lastCompletion = useRef("")

  useEffect(() => {
    if (!completion || !editor) return
    const diff = completion.slice(lastCompletion.current.length)
    lastCompletion.current = completion
    editor.commands.insertContent(diff)
  }, [completion, editor])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  console.log(`summary --`, summary)

  return (
    <div className="text-card-foreground flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-xs border bg-black">
      {/* Toolbar */}

      <div className="flex items-center justify-between border-b">
        <div className="bg-muted/20 flex items-center gap-1 border-b p-2">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="text-muted-foreground hover:text-foreground hover:bg-accent size-8 p-0 disabled:opacity-50"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="text-muted-foreground hover:text-foreground hover:bg-accent size-8 p-0 disabled:opacity-50"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="bg-border mx-1 h-6 w-px" />

          {/* Text Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={getButtonClass(editor.isActive("bold"))}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={getButtonClass(editor.isActive("italic"))}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={getButtonClass(editor.isActive("strike"))}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={getButtonClass(editor.isActive("code"))}
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="bg-border mx-1 h-6 w-px" />

          {/* Heading Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 gap-1 px-2"
              >
                {getActiveHeading()}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border">
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 1 }).run()
                }
                className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 2 }).run()
                }
                className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 3 }).run()
                }
                className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`text-popover-foreground hover:bg-accent hover:text-accent-foreground ${
                  editor.isActive("paragraph") ? "bg-blue-600 text-white" : ""
                }`}
              >
                Paragraph
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            className={getButtonClass(editor.isActive("bulletList"))}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            className={getButtonClass(editor.isActive("orderedList"))}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="bg-border mx-1 h-6 w-px" />
        </div>

        <Button variant="outline" className="mr-2" onClick={summarize}>
          Summarize
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-black p-4">
        <EditorContent
          editor={editor}
          className="prose prose-neutral dark:prose-invert [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_code]:bg-muted max-w-none focus:outline-none [&_.ProseMirror]:min-h-96 [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-4"
        />

        <div className="bg-border h-[1px] w-full" />

        <div>
          {summary && (
            <p className="text-muted-foreground mt-4 text-sm">{summary}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor
