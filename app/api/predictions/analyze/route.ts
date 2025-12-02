// app/api/predictions/analyze/route.ts
import { NextResponse } from "next/server"
import postgres from "postgres"

// Use the same connection as lib/db.ts
const sql = postgres({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: "workstation_monitor",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
})

interface TelemetryRecord {
  timestamp_utc: Date
  computer_name: string
  cpu_percent: number
  mem_percent_used: number
  inferred_watts: number
}

interface DevicePattern {
  name: string
  avgWatts: number
  idleWatts: number
  activeWatts: number
  idlePercentage: number
  totalRecords: number
  hoursMonitored: number
}

interface Anomaly {
  device: string
  type: "high_power" | "unusual_pattern" | "idle_waste" | "spike"
  severity: "critical" | "warning" | "info"
  description: string
  currentValue: number
  expectedValue: number
  deviation: number
  timestamp: string
}

interface PredictionResult {
  currentState: {
    totalDevices: number
    avgPowerDraw: number
    totalDailyKwh: number
    totalMonthlyCost: number
  }
  idleImpactPrediction: {
    devicesAnalyzed: number
    idleDevices: Array<{
      name: string
      currentIdleWatts: number
      hoursIdlePerDay: number
      dailyWasteKwh: number
      monthlyWasteCost: number
      yearlyWasteKwh: number
      yearlyWasteCost: number
      co2KgPerYear: number
    }>
    totalYearlyWaste: {
      kWh: number
      cost: number
      co2Kg: number
    }
  }
  noActionPrediction: {
    nextMonth: {
      estimatedKwh: number
      estimatedCost: number
      co2Kg: number
    }
    nextYear: {
      estimatedKwh: number
      estimatedCost: number
      co2Kg: number
    }
    withRecommendations: {
      yearlyKwh: number
      yearlyCost: number
      yearlySavingsKwh: number
      yearlySavingsCost: number
      co2Reduction: number
    }
  }
  anomalies: Anomaly[]
}

export async function GET() {
  try {
    // Fetch telemetry data (last 7 days) - using postgres library syntax
    const result = await sql`
      SELECT 
        timestamp_utc,
        computer_name,
        cpu_percent,
        mem_percent_used,
        inferred_watts
      FROM metrics_repository
      WHERE timestamp_utc >= NOW() - INTERVAL '7 days'
      ORDER BY timestamp_utc ASC
    `

    if (result.length === 0) {
      return NextResponse.json({
        error: "No telemetry data available",
        predictions: null
      })
    }

    const telemetryData: TelemetryRecord[] = result.map((row: any) => ({
      timestamp_utc: new Date(row.timestamp_utc),
      computer_name: row.computer_name,
      cpu_percent: parseFloat(row.cpu_percent),
      mem_percent_used: parseFloat(row.mem_percent_used),
      inferred_watts: parseFloat(row.inferred_watts)
    }))

    // Fetch recommendations for comparison
    const recsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/recommendations/compute`, {
      cache: 'no-store'
    })
    
    let totalRecommendedSavings = 0
    if (recsResponse.ok) {
      const recsData = await recsResponse.json()
      totalRecommendedSavings = recsData.recommendations?.reduce(
        (sum: number, rec: any) => sum + rec.estimatedSavings, 
        0
      ) || 0
    }

    const predictions = analyzePowerConsumption(telemetryData, totalRecommendedSavings)

    return NextResponse.json({
      success: true,
      predictions,
      dataPoints: telemetryData.length,
      timeRange: {
        start: telemetryData[0].timestamp_utc,
        end: telemetryData[telemetryData.length - 1].timestamp_utc
      }
    })

  } catch (error) {
    console.error("Error analyzing predictions:", error)
    return NextResponse.json(
      { error: "Failed to analyze predictions" },
      { status: 500 }
    )
  }
}

function analyzePowerConsumption(
  data: TelemetryRecord[], 
  recommendedSavings: number
): PredictionResult {
  
  // Group data by device
  const deviceData = groupByDevice(data)
  
  // Analyze each device's patterns
  const devicePatterns = analyzeDevicePatterns(deviceData)
  
  // Calculate current state
  const currentState = calculateCurrentState(devicePatterns)
  
  // Predict idle impact
  const idleImpact = predictIdleImpact(devicePatterns)
  
  // Predict no-action scenario
  const noActionPred = predictNoActionScenario(currentState, recommendedSavings)
  
  // Detect anomalies
  const anomalies = detectAnomalies(devicePatterns, data)
  
  return {
    currentState,
    idleImpactPrediction: idleImpact,
    noActionPrediction: noActionPred,
    anomalies
  }
}

function groupByDevice(data: TelemetryRecord[]): Map<string, TelemetryRecord[]> {
  const grouped = new Map<string, TelemetryRecord[]>()
  
  for (const record of data) {
    if (!grouped.has(record.computer_name)) {
      grouped.set(record.computer_name, [])
    }
    grouped.get(record.computer_name)!.push(record)
  }
  
  return grouped
}

function analyzeDevicePatterns(deviceData: Map<string, TelemetryRecord[]>): DevicePattern[] {
  const patterns: DevicePattern[] = []
  
  for (const [name, records] of deviceData.entries()) {
    // Calculate average power
    const avgWatts = records.reduce((sum, r) => sum + r.inferred_watts, 0) / records.length
    
    // Identify idle vs active (idle = CPU < 20%)
    const idleRecords = records.filter(r => r.cpu_percent < 20)
    const activeRecords = records.filter(r => r.cpu_percent >= 20)
    
    const idleWatts = idleRecords.length > 0
      ? idleRecords.reduce((sum, r) => sum + r.inferred_watts, 0) / idleRecords.length
      : avgWatts * 0.7 // Estimate if no idle data
    
    const activeWatts = activeRecords.length > 0
      ? activeRecords.reduce((sum, r) => sum + r.inferred_watts, 0) / activeRecords.length
      : avgWatts * 1.3 // Estimate if no active data
    
    const idlePercentage = (idleRecords.length / records.length) * 100
    
    // Calculate hours monitored
    const timeSpan = records[records.length - 1].timestamp_utc.getTime() - records[0].timestamp_utc.getTime()
    const hoursMonitored = timeSpan / (1000 * 60 * 60)
    
    patterns.push({
      name,
      avgWatts: Math.round(avgWatts * 100) / 100,
      idleWatts: Math.round(idleWatts * 100) / 100,
      activeWatts: Math.round(activeWatts * 100) / 100,
      idlePercentage: Math.round(idlePercentage * 100) / 100,
      totalRecords: records.length,
      hoursMonitored: Math.round(hoursMonitored * 100) / 100
    })
  }
  
  return patterns
}

function calculateCurrentState(patterns: DevicePattern[]) {
  const totalDevices = patterns.length
  const avgPowerDraw = patterns.reduce((sum, p) => sum + p.avgWatts, 0) / totalDevices
  
  // Assume 24/7 operation for prediction
  const totalDailyKwh = (avgPowerDraw * totalDevices * 24) / 1000
  const totalMonthlyCost = totalDailyKwh * 30 * 16.3 // KES 16.30/kWh
  
  return {
    totalDevices,
    avgPowerDraw: Math.round(avgPowerDraw * 100) / 100,
    totalDailyKwh: Math.round(totalDailyKwh * 100) / 100,
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100
  }
}

function predictIdleImpact(patterns: DevicePattern[]) {
  // Find devices spending significant time idle (>50% of time at <20% CPU)
  const idleDevices = patterns
    .filter(p => p.idlePercentage > 50 && p.idleWatts > 40)
    .map(p => {
      // Estimate hours idle per day based on observed pattern
      const hoursIdlePerDay = (p.idlePercentage / 100) * 24
      
      // Potential savings if device sleeps (assume 5W in sleep mode)
      const sleepWatts = 5
      const wasteWattsPerHour = p.idleWatts - sleepWatts
      
      const dailyWasteKwh = (wasteWattsPerHour * hoursIdlePerDay) / 1000
      const monthlyWasteCost = dailyWasteKwh * 30 * 16.3
      const yearlyWasteKwh = dailyWasteKwh * 365
      const yearlyWasteCost = yearlyWasteKwh * 16.3
      const co2KgPerYear = yearlyWasteKwh * 0.4 // Kenya grid intensity
      
      return {
        name: p.name,
        currentIdleWatts: p.idleWatts,
        hoursIdlePerDay: Math.round(hoursIdlePerDay * 100) / 100,
        dailyWasteKwh: Math.round(dailyWasteKwh * 100) / 100,
        monthlyWasteCost: Math.round(monthlyWasteCost * 100) / 100,
        yearlyWasteKwh: Math.round(yearlyWasteKwh * 100) / 100,
        yearlyWasteCost: Math.round(yearlyWasteCost * 100) / 100,
        co2KgPerYear: Math.round(co2KgPerYear * 100) / 100
      }
    })
  
  const totalYearlyWaste = idleDevices.reduce((sum, d) => ({
    kWh: sum.kWh + d.yearlyWasteKwh,
    cost: sum.cost + d.yearlyWasteCost,
    co2Kg: sum.co2Kg + d.co2KgPerYear
  }), { kWh: 0, cost: 0, co2Kg: 0 })
  
  return {
    devicesAnalyzed: patterns.length,
    idleDevices,
    totalYearlyWaste: {
      kWh: Math.round(totalYearlyWaste.kWh * 100) / 100,
      cost: Math.round(totalYearlyWaste.cost * 100) / 100,
      co2Kg: Math.round(totalYearlyWaste.co2Kg * 100) / 100
    }
  }
}

function predictNoActionScenario(currentState: any, recommendedSavings: number) {
  // Project current consumption into future
  const dailyKwh = currentState.totalDailyKwh
  const monthlyKwh = dailyKwh * 30
  const yearlyKwh = dailyKwh * 365
  
  const nextMonth = {
    estimatedKwh: Math.round(monthlyKwh * 100) / 100,
    estimatedCost: Math.round(monthlyKwh * 16.3 * 100) / 100,
    co2Kg: Math.round(monthlyKwh * 0.4 * 100) / 100
  }
  
  const nextYear = {
    estimatedKwh: Math.round(yearlyKwh * 100) / 100,
    estimatedCost: Math.round(yearlyKwh * 16.3 * 100) / 100,
    co2Kg: Math.round(yearlyKwh * 0.4 * 100) / 100
  }
  
  // Compare with implementing recommendations
  const withRecommendationsKwh = yearlyKwh - recommendedSavings
  const withRecommendationsCost = withRecommendationsKwh * 16.3
  
  const withRecommendations = {
    yearlyKwh: Math.round(withRecommendationsKwh * 100) / 100,
    yearlyCost: Math.round(withRecommendationsCost * 100) / 100,
    yearlySavingsKwh: Math.round(recommendedSavings * 100) / 100,
    yearlySavingsCost: Math.round(recommendedSavings * 16.3 * 100) / 100,
    co2Reduction: Math.round(recommendedSavings * 0.4 * 100) / 100
  }
  
  return {
    nextMonth,
    nextYear,
    withRecommendations
  }
}

function detectAnomalies(patterns: DevicePattern[], data: TelemetryRecord[]): Anomaly[] {
  const anomalies: Anomaly[] = []
  
  // Calculate overall statistics
  const allWatts = patterns.map(p => p.avgWatts)
  const meanWatts = allWatts.reduce((sum, w) => sum + w, 0) / allWatts.length
  const stdDev = Math.sqrt(
    allWatts.reduce((sum, w) => sum + Math.pow(w - meanWatts, 2), 0) / allWatts.length
  )
  
  // Detect high power devices (>2 standard deviations)
  for (const pattern of patterns) {
    const zScore = (pattern.avgWatts - meanWatts) / stdDev
    
    if (zScore > 2) {
      anomalies.push({
        device: pattern.name,
        type: "high_power",
        severity: zScore > 3 ? "critical" : "warning",
        description: `Device consuming ${Math.round((zScore - 1) * 100)}% more power than average`,
        currentValue: pattern.avgWatts,
        expectedValue: Math.round(meanWatts * 100) / 100,
        deviation: Math.round((pattern.avgWatts - meanWatts) * 100) / 100,
        timestamp: new Date().toISOString()
      })
    }
    
    // Detect excessive idle power
    if (pattern.idlePercentage > 70 && pattern.idleWatts > 60) {
      anomalies.push({
        device: pattern.name,
        type: "idle_waste",
        severity: pattern.idleWatts > 80 ? "critical" : "warning",
        description: `Device idle ${Math.round(pattern.idlePercentage)}% of time, consuming ${pattern.idleWatts}W`,
        currentValue: pattern.idleWatts,
        expectedValue: 20,
        deviation: pattern.idleWatts - 20,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Detect sudden spikes in recent data (last 24 hours)
  const recentData = data.filter(r => {
    const hoursSince = (Date.now() - r.timestamp_utc.getTime()) / (1000 * 60 * 60)
    return hoursSince <= 24
  })
  
  const deviceRecentData = groupByDevice(recentData)
  
  for (const [deviceName, records] of deviceRecentData.entries()) {
    const pattern = patterns.find(p => p.name === deviceName)
    if (!pattern) continue
    
    const maxRecentWatts = Math.max(...records.map(r => r.inferred_watts))
    
    // Spike detection (>50% above average)
    if (maxRecentWatts > pattern.avgWatts * 1.5) {
      anomalies.push({
        device: deviceName,
        type: "spike",
        severity: maxRecentWatts > pattern.avgWatts * 2 ? "critical" : "warning",
        description: `Power spike detected: ${Math.round(maxRecentWatts)}W (${Math.round((maxRecentWatts / pattern.avgWatts - 1) * 100)}% above normal)`,
        currentValue: maxRecentWatts,
        expectedValue: pattern.avgWatts,
        deviation: Math.round((maxRecentWatts - pattern.avgWatts) * 100) / 100,
        timestamp: records.find(r => r.inferred_watts === maxRecentWatts)?.timestamp_utc.toISOString() || new Date().toISOString()
      })
    }
  }
  
  // Sort by severity - Fixed TypeScript error by explicitly typing parameters
  anomalies.sort((a: Anomaly, b: Anomaly) => {
    const severityOrder: Record<"critical" | "warning" | "info", number> = { 
      critical: 0, 
      warning: 1, 
      info: 2 
    }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
  
  return anomalies
}