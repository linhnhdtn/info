import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  if (isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 })
  }

  const monthStart = year * 100 + 1   // e.g. 202601
  const monthEnd = year * 100 + 12     // e.g. 202612

  try {
    const [budgets, expenses] = await Promise.all([
      prisma.budget.findMany({
        where: {
          userId: session.user.id,
          month: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
      }),
    ])

    const budgetMap = new Map(budgets.map((b) => [b.month, b.totalBudget]))

    const months = Array.from({ length: 12 }, (_, i) => {
      const month = year * 100 + (i + 1)
      const totalBudget = budgetMap.get(month) ?? null
      const totalSpent = expenses
        .filter((e) => {
          const d = new Date(e.date)
          return d.getMonth() === i && d.getFullYear() === year
        })
        .reduce((sum, e) => sum + e.amount, 0)

      return { month, totalBudget, totalSpent }
    })

    const totalBudget = months.reduce((s, m) => s + (m.totalBudget ?? 0), 0)
    const totalSpent = months.reduce((s, m) => s + m.totalSpent, 0)

    return NextResponse.json({ year, months, totalBudget, totalSpent })
  } catch (e) {
    console.error("GET /api/expenses/yearly error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
