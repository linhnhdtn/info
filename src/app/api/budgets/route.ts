import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  if (!month) return NextResponse.json({ error: "month is required" }, { status: 400 })

  try {
    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: session.user.id, month: parseInt(month) } },
    })
    return NextResponse.json(budget)
  } catch (e) {
    console.error("GET /api/budgets error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { month, totalBudget, dailyAllowances } = body

  if (!month || !totalBudget) {
    return NextResponse.json({ error: "month and totalBudget are required" }, { status: 400 })
  }

  try {
    const budget = await prisma.budget.upsert({
      where: { userId_month: { userId: session.user.id, month } },
      update: { totalBudget, dailyAllowances },
      create: {
        userId: session.user.id,
        month,
        totalBudget,
        dailyAllowances,
      },
    })
    return NextResponse.json(budget)
  } catch (e) {
    console.error("POST /api/budgets error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
