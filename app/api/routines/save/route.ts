import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "routines.json")

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { audit_name, location, frequency, devices } = body

        if (!audit_name || !devices || devices.length === 0 || !frequency) {
            return NextResponse.json({ error: "audit_name, frequency, and devices are required" }, { status: 400 })
        }

        // Ensure the data directory and file exist
        const dataDir = path.dirname(DATA_FILE)
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
        }

        let routines = []
        if (fs.existsSync(DATA_FILE)) {
            try {
                const fileContent = fs.readFileSync(DATA_FILE, "utf-8")
                routines = JSON.parse(fileContent)
            } catch (e) {
                console.error("Error parsing routines file:", e)
            }
        }

        const newRoutine = {
            id: Date.now().toString(),
            audit_name,
            location: location || "Unknown",
            frequency,
            devices,
            created_at: new Date().toISOString()
        }

        routines.push(newRoutine)

        fs.writeFileSync(DATA_FILE, JSON.stringify(routines, null, 2))

        return NextResponse.json({ success: true, routine_id: newRoutine.id })
    } catch (error) {
        console.error("[v0] Error saving routine:", error)
        return NextResponse.json({ error: "Failed to save routine" }, { status: 500 })
    }
}
