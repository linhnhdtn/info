"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserProfile } from "@/types"

export function WelcomeCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối"
  const displayName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : null

  const today = now.toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
      <div className="flex items-center gap-4">
        {loading ? (
          <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
        ) : (
          <Avatar className="h-16 w-16 border-2 border-white/50">
            {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="avatar" />}
            <AvatarFallback className="bg-white/20 text-white text-xl">
              {displayName ? displayName.slice(0, 2).toUpperCase() : "👤"}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          {loading ? (
            <Skeleton className="h-7 w-48 bg-white/30 mb-1" />
          ) : (
            <h2 className="text-xl font-bold">
              {greeting}{displayName ? `, ${displayName}!` : "!"}
            </h2>
          )}
          <p className="text-blue-100 text-sm capitalize">{today}</p>
        </div>
      </div>
    </div>
  )
}
