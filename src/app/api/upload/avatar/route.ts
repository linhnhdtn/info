import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const filename = `${session.user.id}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")

  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = `/uploads/avatars/${filename}`

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { avatarUrl: url },
    create: { userId: session.user.id, avatarUrl: url },
  })

  return NextResponse.json({ url })
}
