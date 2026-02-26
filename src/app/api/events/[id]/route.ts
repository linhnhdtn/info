import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function getEvent(id: string, userId: string) {
  return prisma.event.findFirst({ where: { id, userId } })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const event = await getEvent(id, session.user.id)
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(event)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await getEvent(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const { title, description, start, end, allDay, location, color, reminderAt, isRepeating, repeatRule, repeatUntil } = body

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(start !== undefined && { startDate: new Date(start) }),
      ...(end !== undefined && { endDate: end ? new Date(end) : null }),
      ...(allDay !== undefined && { allDay }),
      ...(location !== undefined && { location: location || null }),
      ...(color !== undefined && { color }),
      ...(reminderAt !== undefined && { reminderAt: reminderAt ? new Date(reminderAt) : null }),
      ...(isRepeating !== undefined && { isRepeating }),
      ...(repeatRule !== undefined && { repeatRule: repeatRule || null }),
      ...(repeatUntil !== undefined && { repeatUntil: repeatUntil ? new Date(repeatUntil) : null }),
    },
  })
  return NextResponse.json(event)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await getEvent(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
