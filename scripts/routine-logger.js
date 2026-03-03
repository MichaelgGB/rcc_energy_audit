import fs from "fs"
import path from "path"
import postgres from "postgres"

const DATA_FILE = path.join(process.cwd(), "data", "routines.json")

const sqlEnergy = postgres({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: "energy_db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: process.env.NODE_ENV === "production" ? "require" : false,
})

async function processRoutines() {
    console.log(`[Routine Logger] Started at ${new Date().toISOString()}`)

    if (!fs.existsSync(DATA_FILE)) {
        console.log("[Routine Logger] No routines file found. Exiting.")
        process.exit(0)
    }

    try {
        const fileContent = fs.readFileSync(DATA_FILE, "utf-8")
        const routines = JSON.parse(fileContent)

        if (routines.length === 0) {
            console.log("[Routine Logger] No active routines found. Exiting.")
            process.exit(0)
        }

        for (const routine of routines) {
            console.log(`[Routine Logger] Processing routine: ${routine.audit_name} (${routine.frequency})`)

            // Basic frequency check (a real system would store last_run and calculate intervals, this is a simplified version assuming a daily cron job)
            const auditDate = new Date().toISOString()

            // Insert audit
            const auditResult = await sqlEnergy`
        INSERT INTO audits (audit_name, location, audit_date) 
        VALUES (${routine.audit_name}, ${routine.location}, ${auditDate}) 
        RETURNING audit_id
      `
            const auditId = auditResult[0].audit_id
            console.log(`[Routine Logger] Created Audit ID: ${auditId}`)

            // Insert devices
            for (const device of routine.devices) {
                await sqlEnergy`
          INSERT INTO devices (audit_id, device_class, description, power_rating_watts, quantity, hours_per_day)
          VALUES (${auditId}, ${device.device_class}, ${device.description}, ${device.power_rating_watts}, ${device.quantity}, ${device.hours_per_day})
        `
            }
        }

        console.log(`[Routine Logger] Finished processing ${routines.length} routines successfully.`)

    } catch (err) {
        console.error(`[Routine Logger] Error:`, err)
    } finally {
        await sqlEnergy.end()
    }
}

processRoutines()
