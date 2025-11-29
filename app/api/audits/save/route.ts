import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audit_name, location, devices } = body

    if (!audit_name || !devices || devices.length === 0) {
      return NextResponse.json({ error: "audit_name and devices are required" }, { status: 400 })
    }

    // Insert audit
    const auditId = await db.saveAudit(audit_name, location || "Unknown", new Date().toISOString())
    console.log("[v0] Saved audit:", auditId)

    // Insert each device
    for (const device of devices) {
      await db.saveDevice(
        auditId,
        device.device_class,
        device.description,
        device.power_rating_watts,
        device.quantity,
        device.hours_per_day,
      )
    }

    return NextResponse.json({ success: true, audit_id: auditId })
  } catch (error) {
    console.error("[v0] Error saving audit:", error)
    return NextResponse.json({ error: "Failed to save audit to database" }, { status: 500 })
  }
}
