import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function getNote(id: string, userId: string) {
  return prisma.note.findFirst({ where: { id, userId } })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const note = await getNote(id, session.user.id)
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(note)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await getNote(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json()
  const { title, content, color, isPinned, tags, isArchived } = body

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title || null }),
      ...(content !== undefined && { content }),
      ...(color !== undefined && { color }),
      ...(isPinned !== undefined && { isPinned }),
      ...(tags !== undefined && { tags }),
      ...(isArchived !== undefined && { isArchived }),
    },
  })
  return NextResponse.json(note)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await getNote(id, session.user.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
