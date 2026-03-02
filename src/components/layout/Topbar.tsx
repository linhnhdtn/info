"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { KeyRound, LogOut } from "lucide-react"
import { MobileNav } from "./MobileNav"
import { toast } from "sonner"

interface TopbarProps {
  avatarUrl?: string | null
  displayName?: string | null
}

export function Topbar({ avatarUrl, displayName }: TopbarProps) {
  const { data: session } = useSession()
  const name = displayName || session?.user?.name || "Admin"
  const initials = name.slice(0, 2).toUpperCase()

  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function resetForm() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setConfirming(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp")
      return
    }

    setConfirming(true)
  }

  async function handleConfirm() {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Đã xảy ra lỗi")
        setConfirming(false)
        setLoading(false)
        return
      }

      toast.success("Đổi mật khẩu thành công! Đang đăng xuất...")
      setOpen(false)
      resetForm()
      setTimeout(() => {
        signOut({ callbackUrl: "/login" })
      }, 1000)
    } catch {
      setError("Đã xảy ra lỗi, vui lòng thử lại")
      setConfirming(false)
      setLoading(false)
    }
  }

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
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Đặt lại mật khẩu
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Sau khi thay đổi mật khẩu, bạn sẽ bị đăng xuất và cần đăng nhập lại.
            </DialogDescription>
          </DialogHeader>

          {!confirming ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Tài khoản</Label>
                <Input
                  id="account"
                  value={session?.user?.name || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Đổi mật khẩu
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800 font-medium">
                  Bạn có chắc chắn muốn thay đổi mật khẩu?
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Bạn sẽ bị đăng xuất ngay sau khi đổi mật khẩu và cần đăng nhập lại bằng mật khẩu mới.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirming(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}
