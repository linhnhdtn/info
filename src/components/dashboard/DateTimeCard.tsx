"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { getLunarDateInfo, type LunarDateInfo } from "@/lib/lunar"

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]

function formatTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
}

function formatSolarDate(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()]
  const dd = date.getDate().toString().padStart(2, "0")
  const mm = (date.getMonth() + 1).toString().padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${weekday}, ngày ${dd} tháng ${mm} năm ${yyyy}`
}

function formatLunarDate(lunar: LunarDateInfo): string {
  const leapStr = lunar.isLeapMonth ? " (nhuận)" : ""
  return `Ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth}${leapStr} năm ${lunar.canChiYear}`
}

export function DateTimeCard() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!now) return null

  const lunar = getLunarDateInfo(now)

  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-violet-200 shrink-0" />
          <span className="text-4xl font-mono font-bold tracking-wider">
            {formatTime(now)}
          </span>
        </div>
        <div className="sm:ml-auto space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-200 shrink-0" />
            <span className="text-violet-100">{formatSolarDate(now)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-200 shrink-0" />
            <span className="text-violet-100">
              {formatLunarDate(lunar)} — con {lunar.conGiap}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
