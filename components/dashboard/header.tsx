"use client"

import type * as React from "react"
import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface HeaderUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string | null
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: HeaderUser
  setSidebarOpen?: (open: boolean) => void
}

export function Header({ user, setSidebarOpen, className, ...props }: HeaderProps) {
  const initials =
    user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : user.email?.slice(0, 2).toUpperCase()

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className,
      )}
      {...props}
    >
      {/* left */}
      <div className="flex items-center gap-2">
        {setSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span className="text-base font-semibold text-gray-800 hidden sm:inline">MindReMinder</span>
      </div>

      {/* right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8">
          {user.profileImage ? (
            <AvatarImage src={user.profileImage || "/placeholder.svg"} alt="User avatar" />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  )
}
