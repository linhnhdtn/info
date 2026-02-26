import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tag = searchParams.get("tag")
  const search = searchParams.get("search")
  const pinned = searchParams.get("pinned") === "true"

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
      ...(pinned ? { isPinned: true } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  })
  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { title, content, color, isPinned, tags } = body

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: title || null,
      content: content || "",
      color: color || "#FFFFFF",
      isPinned: isPinned || false,
      tags: tags || [],
    },
  })
  return NextResponse.json(note, { status: 201 })
}
