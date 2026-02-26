import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const events = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
      ...(start && end ? {
        startDate: { gte: new Date(start), lte: new Date(end) },
      } : {}),
    },
    orderBy: { startDate: "asc" },
  })

  return NextResponse.json(events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    start: e.startDate.toISOString(),
    end: e.endDate?.toISOString() ?? null,
    allDay: e.allDay,
    location: e.location,
    color: e.color,
    reminderAt: e.reminderAt?.toISOString() ?? null,
    isRepeating: e.isRepeating,
    rrule: e.repeatRule ?? undefined,
  })))
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { title, description, start, end, allDay, location, color, reminderAt, isRepeating, repeatRule, repeatUntil } = body

  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      startDate: new Date(start),
      endDate: end ? new Date(end) : null,
      allDay: allDay || false,
      location: location || null,
      color: color || "#3B82F6",
      reminderAt: reminderAt ? new Date(reminderAt) : null,
      isRepeating: isRepeating || false,
      repeatRule: repeatRule || null,
      repeatUntil: repeatUntil ? new Date(repeatUntil) : null,
    },
  })
  return NextResponse.json(event, { status: 201 })
}
