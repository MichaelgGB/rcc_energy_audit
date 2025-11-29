import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const metrics = await db.getMetrics(10000)

    const computerNames = new Set(metrics.map((m: any) => m.computer_name))

    return NextResponse.json({
      totalMetrics: metrics.length,
      computersMonitored: computerNames.size,
      lastUpdate: metrics[0]?.timestamp_utc || new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching metrics stats:", error)
    return NextResponse.json({
      totalMetrics: 0,
      computersMonitored: 0,
      lastUpdate: new Date().toISOString(),
    })
  }
}
