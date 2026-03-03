import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
    try {
        // 1. Fetch manual audits and their devices
        const audits = await db.getAllAudits()

        let totalManualDailyKwh = 0
        const locationMap = new Map()
        const deviceClassMap = new Map()

        for (const audit of audits) {
            const devices = await db.getDevicesByAudit(audit.audit_id)
            const location = audit.location || "Unknown"

            if (!locationMap.has(location)) locationMap.set(location, 0)

            for (const device of devices) {
                const dailyKwh = Number(device.daily_kwh_total) || 0
                totalManualDailyKwh += dailyKwh

                locationMap.set(location, locationMap.get(location) + dailyKwh)

                const deviceClass = device.device_class || "Other"
                if (!deviceClassMap.has(deviceClass)) deviceClassMap.set(deviceClass, 0)
                deviceClassMap.set(deviceClass, deviceClassMap.get(deviceClass) + dailyKwh)
            }
        }

        // 2. Fetch recent telemetry records to estimate workstation consumption
        // For a real-world scenario, this might need more complex time-series aggregation.
        // Here we'll take a sample and extrapolate an average daily consumption.
        const metrics = await db.getMetricsForAnalysis()

        // Group telemetry by computer to avoid double counting across a time period
        const computerMap = new Map()
        let totalInferredWatts = 0
        let telemetryRecordCount = 0

        if (metrics && metrics.length > 0) {
            for (const metric of metrics) {
                const watts = Number(metric.inferred_watts) || 0
                totalInferredWatts += watts
                telemetryRecordCount++

                if (!computerMap.has(metric.computer_name)) {
                    computerMap.set(metric.computer_name, true)
                }
            }
        }

        // Estimate daily kWh from telemetry (assuming the sample represents an average hour, extrapolated to 24 hours)
        // Average Watts * 24h / 1000 = Daily kWh
        let telemetryDailyKwh = 0
        if (telemetryRecordCount > 0) {
            const avgWatts = totalInferredWatts / telemetryRecordCount
            // Multiply by active computers to simulate total load
            const uniqueComputers = computerMap.size
            telemetryDailyKwh = (avgWatts * uniqueComputers * 24) / 1000
        }

        // Combine manual and telemetry data
        const totalDailyKwh = totalManualDailyKwh + telemetryDailyKwh
        const activeCarbonFactor = 0.4 // kg CO2/kWh, usually configurable

        const annualKwh = totalDailyKwh * 365
        const totalAnnualCarbonKg = annualKwh * activeCarbonFactor
        const treesEquivalent = totalAnnualCarbonKg / 21 // Approx 21kg absorbed per tree per year

        return NextResponse.json({
            summary: {
                totalDailyKwh: Math.round(totalDailyKwh * 100) / 100,
                annualKwh: Math.round(annualKwh * 100) / 100,
                totalAnnualCarbonKg: Math.round(totalAnnualCarbonKg * 100) / 100,
                treesEquivalent: Math.round(treesEquivalent * 10) / 10,
                carbonFactorUsed: activeCarbonFactor
            },
            breakdowns: {
                byLocation: Array.from(locationMap.entries()).map(([location, kwh]) => ({
                    location,
                    dailyKwh: Math.round(kwh * 100) / 100,
                    annualCarbonKg: Math.round(kwh * 365 * activeCarbonFactor * 100) / 100
                })),
                byDeviceClass: Array.from(deviceClassMap.entries()).map(([deviceClass, kwh]) => ({
                    deviceClass,
                    dailyKwh: Math.round(kwh * 100) / 100,
                    annualCarbonKg: Math.round(kwh * 365 * activeCarbonFactor * 100) / 100
                })),
                telemetry: {
                    activeComputers: computerMap.size,
                    estimatedDailyKwh: Math.round(telemetryDailyKwh * 100) / 100,
                    estimatedAnnualCarbonKg: Math.round(telemetryDailyKwh * 365 * activeCarbonFactor * 100) / 100
                }
            }
        })

    } catch (error) {
        console.error("[v0] Error calculating systemic carbon footprint:", error)
        return NextResponse.json({ error: "Failed to calculate carbon metrics" }, { status: 500 })
    }
}
