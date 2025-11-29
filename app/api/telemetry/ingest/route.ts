import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csv_data } = body

    if (!csv_data) {
      return NextResponse.json({ error: "csv_data is required" }, { status: 400 })
    }

    const insertedIds = await db.ingestMetrics(csv_data)
    console.log("[v0] Ingested metrics:", insertedIds.length)

    return NextResponse.json({
      success: true,
      inserted_count: insertedIds.length,
      ids: insertedIds,
    })
  } catch (error) {
    console.error("[v0] Error ingesting telemetry:", error)
    return NextResponse.json({ error: "Failed to ingest telemetry data" }, { status: 500 })
  }
}
