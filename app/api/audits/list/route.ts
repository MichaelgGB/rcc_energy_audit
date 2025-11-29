import { NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET() {
  try {
    const audits = await db.getAllAudits()

    // Fetch devices for each audit
    const auditsWithDevices = await Promise.all(
      audits.map(async (audit) => {
        const devices = await db.getDevicesByAudit(audit.audit_id)
        return { ...audit, devices }
      }),
    )

    return NextResponse.json(auditsWithDevices)
  } catch (error) {
    console.error("[v0] Error fetching audits:", error)
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 })
  }
}
