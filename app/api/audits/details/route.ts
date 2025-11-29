import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const auditId = request.nextUrl.searchParams.get("id")

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 })
    }

    const audit = await db.getAudit(Number.parseInt(auditId))
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    const devices = await db.getDevicesByAudit(audit.audit_id)
    return NextResponse.json({ ...audit, devices })
  } catch (error) {
    console.error("[v0] Error fetching audit details:", error)
    return NextResponse.json({ error: "Failed to fetch audit details" }, { status: 500 })
  }
}
