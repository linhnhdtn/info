import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { firstName, lastName, phone, email, address, city, country, birthday, bio } = body

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      country: country || null,
      birthday: birthday ? new Date(birthday) : null,
      bio: bio || null,
    },
    create: {
      userId: session.user.id,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      country: country || null,
      birthday: birthday ? new Date(birthday) : null,
      bio: bio || null,
    },
  })
  return NextResponse.json(profile)
}
