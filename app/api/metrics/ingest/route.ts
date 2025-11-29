import { type NextRequest, NextResponse } from "next/server"
import * as db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { raw_csv_data } = body

    if (!raw_csv_data || !raw_csv_data.trim()) {
      return NextResponse.json({ error: "raw_csv_data is required" }, { status: 400 })
    }

    const insertedIds = await db.ingestMetrics(raw_csv_data)
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
