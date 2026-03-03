import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const audits = await db.getAllAudits()

    // Group by location
    const locationMap = new Map<string, number>()
    // Group by device class
    const deviceClassMap = new Map<string, number>()
    // Per-device detail list
    const deviceDetail: {
      auditName: string
      location: string
      deviceClass: string
      description: string
      powerWatts: number
      hoursPerDay: number
      dailyKwh: number
    }[] = []

    for (const audit of audits) {
      const devices = await db.getDevicesByAudit(audit.audit_id)
      const location = audit.location || "Unknown"

      if (!locationMap.has(location)) {
        locationMap.set(location, 0)
      }

      for (const device of devices) {
        const dailyKwh = Number(device.daily_kwh_total) || 0

        locationMap.set(location, (locationMap.get(location) || 0) + dailyKwh)

        const deviceClass = device.device_class || "Other"
        if (!deviceClassMap.has(deviceClass)) {
          deviceClassMap.set(deviceClass, 0)
        }
        deviceClassMap.set(deviceClass, (deviceClassMap.get(deviceClass) || 0) + dailyKwh)

        deviceDetail.push({
          auditName: audit.audit_name,
          location,
          deviceClass,
          description: device.description || "",
          powerWatts: Number(device.power_rating_watts) || 0,
          hoursPerDay: Number(device.hours_per_day) || 0,
          dailyKwh: Math.round(dailyKwh * 100) / 100,
        })
      }
    }

    // Sort device detail by daily kWh descending
    deviceDetail.sort((a, b) => b.dailyKwh - a.dailyKwh)

    return NextResponse.json({
      // Filter out zero-kWh locations
      labComparison: Array.from(locationMap.entries())
        .filter(([, totalKwh]) => totalKwh > 0)
        .map(([location, totalKwh]) => ({
          location,
          totalKwh: Math.round(totalKwh * 100) / 100,
        })),
      // Filter out zero-kWh device classes; add `name` for Recharts label resolution
      deviceClassBreakdown: Array.from(deviceClassMap.entries())
        .filter(([, totalKwh]) => totalKwh > 0)
        .map(([device_class, totalKwh]) => ({
          device_class,
          name: device_class, // Required by Recharts <Pie> for label rendering
          totalKwh: Math.round(totalKwh * 100) / 100,
        })),
      deviceDetail,
    })
  } catch (error) {
    console.error("[v0] Error fetching audit analysis:", error)
    return NextResponse.json({
      labComparison: [],
      deviceClassBreakdown: [],
      deviceDetail: [],
    })
  }
}
