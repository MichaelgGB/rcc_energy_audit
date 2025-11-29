import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const audits = await db.getAllAudits()

    // Group by location
    const locationMap = new Map()
    // Group by device class
    const deviceClassMap = new Map()

    for (const audit of audits) {
      const devices = await db.getDevicesByAudit(audit.audit_id)

      // Location breakdown
      const location = audit.location || "Unknown"
      if (!locationMap.has(location)) {
        locationMap.set(location, 0)
      }

      // Device class breakdown
      for (const device of devices) {
        const dailyKwh = device.daily_kwh_total || 0

        locationMap.set(location, (locationMap.get(location) || 0) + dailyKwh)

        const deviceClass = device.device_class || "Other"
        if (!deviceClassMap.has(deviceClass)) {
          deviceClassMap.set(deviceClass, 0)
        }
        deviceClassMap.set(deviceClass, (deviceClassMap.get(deviceClass) || 0) + dailyKwh)
      }
    }

    return NextResponse.json({
      labComparison: Array.from(locationMap.entries()).map(([location, totalKwh]) => ({
        location,
        totalKwh: Math.round(totalKwh * 100) / 100,
      })),
      deviceClassBreakdown: Array.from(deviceClassMap.entries()).map(([device_class, totalKwh]) => ({
        device_class,
        totalKwh: Math.round(totalKwh * 100) / 100,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching audit analysis:", error)
    return NextResponse.json({
      labComparison: [],
      deviceClassBreakdown: [],
    })
  }
}
