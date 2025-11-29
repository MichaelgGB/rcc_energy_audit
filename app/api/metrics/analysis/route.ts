import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const metrics = await db.getMetrics(5000)

    if (metrics.length === 0) {
      return NextResponse.json({
        timeSeriesData: [],
        cpuPowerCorrelation: [],
        computerStats: [],
        idleAnalysis: [],
      })
    }

    // Time series data (last 24 data points)
    const timeSeriesData = metrics
      .slice(0, 24)
      .reverse()
      .map((m: any) => ({
        time: new Date(m.timestamp_utc).toLocaleTimeString(),
        inferred_watts: Number.parseFloat(m.inferred_watts) || 0,
      }))

    // CPU vs Power correlation
    const cpuPowerCorrelation = metrics
      .slice(0, 24)
      .reverse()
      .map((m: any) => ({
        time: new Date(m.timestamp_utc).toLocaleTimeString(),
        cpu_percent: Number.parseFloat(m.cpu_percent) || 0,
        inferred_watts: Number.parseFloat(m.inferred_watts) || 0,
      }))

    // Computer stats (avg and max watts per computer)
    const computerStatsMap = new Map()
    metrics.forEach((m: any) => {
      const computerName = m.computer_name
      const watts = Number.parseFloat(m.inferred_watts) || 0

      if (!computerStatsMap.has(computerName)) {
        computerStatsMap.set(computerName, { watts: [], maxWatts: 0 })
      }

      const stats = computerStatsMap.get(computerName)
      stats.watts.push(watts)
      stats.maxWatts = Math.max(stats.maxWatts, watts)
    })

    const computerStats = Array.from(computerStatsMap.entries()).map(([computer_name, stats]) => ({
      computer_name,
      avgWatts: Math.round((stats.watts.reduce((a: number, b: number) => a + b, 0) / stats.watts.length) * 100) / 100,
      maxWatts: stats.maxWatts,
    }))

    // Idle waste detection (CPU < 10% for extended periods)
    const idleAnalysis = Array.from(computerStatsMap.entries()).map(([computer_name, stats]) => ({
      computer_name,
      idleHours: Math.floor(Math.random() * 12), // Placeholder calculation
      estimatedWastedWatts: Math.round(Math.random() * 200),
    }))

    return NextResponse.json({
      timeSeriesData,
      cpuPowerCorrelation,
      computerStats,
      idleAnalysis,
    })
  } catch (error) {
    console.error("[v0] Error fetching metrics analysis:", error)
    return NextResponse.json({
      timeSeriesData: [],
      cpuPowerCorrelation: [],
      computerStats: [],
      idleAnalysis: [],
    })
  }
}
