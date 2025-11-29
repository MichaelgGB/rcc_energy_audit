import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam) : 1000

    const metrics = await db.getMetrics(limit)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
