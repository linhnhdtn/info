"use client"

import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { MobileNav } from "./MobileNav"

interface TopbarProps {
  avatarUrl?: string | null
  displayName?: string | null
}

export function Topbar({ avatarUrl, displayName }: TopbarProps) {
  const { data: session } = useSession()
  const name = displayName || session?.user?.name || "Admin"
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <MobileNav />
      <div className="hidden md:block" />
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-8 w-8 cursor-pointer">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.name}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
