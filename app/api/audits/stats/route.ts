import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const audits = await db.getAllAudits()

    let totalDevices = 0
    let totalDailyKwh = 0

    for (const audit of audits) {
      const devices = await db.getDevicesByAudit(audit.audit_id)
      totalDevices += devices.length
      totalDailyKwh += devices.reduce((sum: number, d: any) => sum + (d.daily_kwh_total || 0), 0)
    }

    return NextResponse.json({
      totalAudits: audits.length,
      totalDevices,
      totalDailyKwh: Math.round(totalDailyKwh * 100) / 100,
    })
  } catch (error) {
    console.error("[v0] Error fetching audit stats:", error)
    return NextResponse.json({
      totalAudits: 0,
      totalDevices: 0,
      totalDailyKwh: 0,
    })
  }
}
