import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const date = searchParams.get("date")
  const category = searchParams.get("category")

  const where: Record<string, unknown> = { userId: session.user.id }

  if (month) {
    const year = Math.floor(parseInt(month) / 100)
    const m = parseInt(month) % 100
    const start = new Date(year, m - 1, 1)
    const end = new Date(year, m, 1)
    where.date = { gte: start, lt: end }
  } else if (date) {
    const d = new Date(date)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    where.date = { gte: start, lt: end }
  }

  if (category) where.category = category

  try {
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    })
    return NextResponse.json(expenses)
  } catch (e) {
    console.error("GET /api/expenses error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { amount, description, category, date } = body

  if (!amount || !category || !date) {
    return NextResponse.json({ error: "amount, category, and date are required" }, { status: 400 })
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        description: description || null,
        category,
        date: new Date(date),
      },
    })
    return NextResponse.json(expense, { status: 201 })
  } catch (e) {
    console.error("POST /api/expenses error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
