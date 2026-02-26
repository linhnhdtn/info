import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const work = await prisma.work.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(work)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const {
    company, position, department, employeeId,
    workEmail, workPhone, workAddress,
    startDate, endDate, salary, notes,
  } = body

  const work = await prisma.work.upsert({
    where: { userId: session.user.id },
    update: {
      company: company || null,
      position: position || null,
      department: department || null,
      employeeId: employeeId || null,
      workEmail: workEmail || null,
      workPhone: workPhone || null,
      workAddress: workAddress || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      salary: salary || null,
      notes: notes || null,
    },
    create: {
      userId: session.user.id,
      company: company || null,
      position: position || null,
      department: department || null,
      employeeId: employeeId || null,
      workEmail: workEmail || null,
      workPhone: workPhone || null,
      workAddress: workAddress || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      salary: salary || null,
      notes: notes || null,
    },
  })
  return NextResponse.json(work)
}
