import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get all metrics from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch raw telemetry data
    const metricsData = await db.getMetricsForAnalysis()

    if (!metricsData || metricsData.length === 0) {
      return NextResponse.json({
        recommendations: [],
        summary: "No telemetry data available for analysis",
      })
    }

    // Analyze patterns and generate recommendations
    const recommendations = generateEnergyRecommendations(metricsData)

    return NextResponse.json({
      recommendations,
      dataPoints: metricsData.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error computing recommendations:", error)
    return NextResponse.json({ error: "Failed to compute recommendations" }, { status: 500 })
  }
}

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  description: string
  estimatedSavings: number
  affectedDevices: string[]
  action: string
}

function generateEnergyRecommendations(metricsData: any[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Group by computer
  const computerStats = new Map<
    string,
    {
      avgWatts: number
      maxWatts: number
      samples: number
      idleCount: number
      peakHours: Set<string>
    }
  >()

  metricsData.forEach((metric: any) => {
    const computer = metric.computer_name
    const watts = Number.parseFloat(metric.inferred_watts) || 0
    const cpu = Number.parseFloat(metric.cpu_percent) || 0

    if (!computerStats.has(computer)) {
      computerStats.set(computer, {
        avgWatts: 0,
        maxWatts: 0,
        samples: 0,
        idleCount: 0,
        peakHours: new Set(),
      })
    }

    const stats = computerStats.get(computer)!
    stats.samples++
    stats.avgWatts += watts
    stats.maxWatts = Math.max(stats.maxWatts, watts)

    if (cpu < 5) stats.idleCount++

    const hour = new Date(metric.timestamp_utc).getHours()
    if (watts > 300) stats.peakHours.add(hour.toString())
  })

  // Normalize averages
  computerStats.forEach((stats) => {
    stats.avgWatts = stats.avgWatts / stats.samples
  })

  // Generate recommendations based on analysis
  const affectedDevices = Array.from(computerStats.keys())

  // 1. Idle Waste Detection
  let totalIdleWaste = 0
  const idleDevices: string[] = []
  computerStats.forEach((stats, computer) => {
    const idlePercent = (stats.idleCount / stats.samples) * 100
    if (idlePercent > 30) {
      idleDevices.push(computer)
      totalIdleWaste += stats.avgWatts * 0.3 * 24 // 30% idle * 24 hours
    }
  })

  if (idleDevices.length > 0) {
    recommendations.push({
      priority: "high",
      category: "Idle Management",
      title: "Implement Automated Sleep Schedules",
      description: `${idleDevices.length} workstations show idle usage over 30% of the time. Enable aggressive sleep mode and auto-shutdown policies during non-business hours.`,
      estimatedSavings: totalIdleWaste * 0.6, // 60% potential savings
      affectedDevices: idleDevices,
      action: "Configure BIOS and OS power settings, enable Wake-on-LAN for morning boot-up",
    })
  }

  // 2. Peak Shaving
  const peakHours = new Map<string, number>()
  computerStats.forEach((stats) => {
    stats.peakHours.forEach((hour) => {
      peakHours.set(hour, (peakHours.get(hour) || 0) + 1)
    })
  })

  if (peakHours.size > 0) {
    const maxPeakHour = Array.from(peakHours.entries()).sort((a, b) => b[1] - a[1])[0]
    const devicesInPeak = maxPeakHour[1]

    recommendations.push({
      priority: "medium",
      category: "Load Balancing",
      title: "Stagger Usage During Peak Hours",
      description: `Power consumption spikes during hour ${maxPeakHour[0]}:00 with ${devicesInPeak} workstations. Stagger lunch breaks and scheduled tasks to reduce simultaneous usage.`,
      estimatedSavings: 50 * devicesInPeak * 1, // Rough estimate
      affectedDevices: affectedDevices,
      action: "Create staggered usage schedule; move batch processing to off-peak hours",
    })
  }

  // 3. High Power Devices
  const highPowerDevices = Array.from(computerStats.entries())
    .filter(([_, stats]) => stats.avgWatts > 200)
    .map(([computer]) => computer)

  if (highPowerDevices.length > 0) {
    recommendations.push({
      priority: "medium",
      category: "Hardware Efficiency",
      title: "Upgrade High-Power Workstations",
      description: `${highPowerDevices.length} workstations exceed 200W average consumption. These are power-inefficient models suitable for replacement with modern, energy-efficient alternatives.`,
      estimatedSavings: (200 * highPowerDevices.length * 8 * 250) / 1000, // Yearly kWh savings
      affectedDevices: highPowerDevices,
      action: "Audit hardware; prioritize replacement of systems over 5 years old",
    })
  }

  // 4. Continuous Monitoring
  if (metricsData.length > 100) {
    recommendations.push({
      priority: "low",
      category: "Best Practices",
      title: "Establish Energy Dashboard for Staff",
      description:
        "Staff awareness of energy consumption can reduce usage by 5-15%. Create a public dashboard showing real-time consumption vs targets.",
      estimatedSavings: 100, // Conservative estimate
      affectedDevices: affectedDevices,
      action: "Deploy public-facing energy dashboard; share bi-weekly reports",
    })
  }

  return recommendations
}
