"use client"

import {
  IconDashboard,
  IconFileText,
  IconInnerShadowTop,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useMutation } from "@tanstack/react-query"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { createNote } from "@/app/actions/notes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type SidebarUser = {
  name: string
  email: string
  image?: string | null
}

export type SidebarNote = {
  id: string
  title: string | null
  contentText: string | null
  updatedAt: Date
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
}

export function AppSidebar({
  user,
  notes = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser
  notes?: SidebarNote[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: noteId => {
      router.push(`/dashboard/notes/${noteId}`)
      router.refresh()
    },
  })

  const handleCreate = () => {
    mutation.mutate()
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">NoteBuddy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarGroup>
          <SidebarGroupLabel>Notes</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleCreate}
                  disabled={mutation.isPending}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IconPlus />
                  <span>New Note</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {notes.map(note => {
                const isActive = pathname === `/dashboard/notes/${note.id}`
                const title = note.title?.trim() || "Untitled"

                return (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={title}
                      className={cn(
                        "flex items-start justify-start gap-2",
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
                      )}
                    >
                      <Link href={`/dashboard/notes/${note.id}`}>
                        <IconFileText className="mt-0.5 shrink-0" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">
                            {title}
                          </span>
                          {/* {note.contentText && !isActive && (
                            <span className="text-muted-foreground group-data-[active=true]/sidebar-menu-button:text-primary-foreground/80 truncate text-xs">
                              {note.contentText}
                            </span>
                          )} */}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {notes.length === 0 && (
                <SidebarMenuItem>
                  <div className="text-muted-foreground px-2 py-1.5 text-xs">
                    No notes yet
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
