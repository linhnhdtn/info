import { NextResponse } from "next/server"

interface AqiLevel {
  label: string
  color: string
}

function getAqiLevel(aqi: number): AqiLevel {
  if (aqi <= 50) return { label: "Tốt", color: "#10B981" }
  if (aqi <= 100) return { label: "Trung bình", color: "#F59E0B" }
  if (aqi <= 150) return { label: "Không tốt cho nhóm nhạy cảm", color: "#F97316" }
  if (aqi <= 200) return { label: "Không tốt", color: "#EF4444" }
  if (aqi <= 300) return { label: "Rất không tốt", color: "#8B5CF6" }
  return { label: "Nguy hại", color: "#991B1B" }
}

export async function GET() {
  const token = process.env.WAQI_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "WAQI_API_TOKEN not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.waqi.info/feed/@13026/?token=${token}`, {
      next: { revalidate: 1800 },
    })
    const json = await res.json()

    if (json.status !== "ok") {
      return NextResponse.json({ error: "WAQI API error" }, { status: 502 })
    }

    const { aqi, iaqi } = json.data
    const level = getAqiLevel(aqi)

    return NextResponse.json({
      aqi,
      level: level.label,
      color: level.color,
      pollutants: {
        pm25: iaqi?.pm25?.v ?? null,
        pm10: iaqi?.pm10?.v ?? null,
        o3: iaqi?.o3?.v ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch AQI data" }, { status: 502 })
  }
}
