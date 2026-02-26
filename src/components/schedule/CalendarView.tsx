"use client"

import { useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventClickArg, DateSelectArg, DatesSetArg } from "@fullcalendar/core"
import { EventForm } from "./EventForm"
import type { CalendarEvent } from "@/types"
import { toast } from "sonner"

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> & { defaultStart?: string } | null>(null)

  async function loadEvents(start: string, end: string) {
    try {
      const res = await fetch(`/api/events?start=${start}&end=${end}`)
      const data = await res.json()
      setEvents(data)
    } catch {
      toast.error("Không thể tải lịch trình")
    }
  }

  function handleDatesSet(info: DatesSetArg) {
    loadEvents(info.start.toISOString(), info.end.toISOString())
  }

  function handleDateSelect(info: DateSelectArg) {
    setSelectedEvent({ defaultStart: info.startStr, allDay: info.allDay })
    setFormOpen(true)
    calendarRef.current?.getApi().unselect()
  }

  function handleEventClick(info: EventClickArg) {
    const ev = events.find((e) => e.id === info.event.id)
    if (ev) {
      setSelectedEvent(ev)
      setFormOpen(true)
    }
  }

  function handleSaved(saved: CalendarEvent) {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id)
      const mapped = {
        ...saved,
        start: saved.start,
        end: saved.end ?? undefined,
      }
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  function handleDeleted(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end ?? undefined,
    allDay: e.allDay,
    backgroundColor: e.color,
    borderColor: e.color,
  }))

  return (
    <>
      <div className="bg-white rounded-lg border p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="vi"
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
          }}
          selectable
          selectMirror
          dayMaxEvents
          events={fcEvents}
          datesSet={handleDatesSet}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
        />
      </div>
      <EventForm
        event={selectedEvent}
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedEvent(null) }}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
