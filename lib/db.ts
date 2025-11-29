import postgres from "postgres"

const sqlEnergy = postgres({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: "energy_db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
})

const sqlMetrics = postgres({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: "workstation_monitor",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
})

export async function query(text: string, params?: any[]) {
  try {
    const result = await sqlEnergy.unsafe(text, params)
    return { rows: result }
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export async function getAudit(auditId: number) {
  const result = await sqlEnergy`SELECT * FROM audits WHERE audit_id = ${auditId}`
  return result[0]
}

export async function getAllAudits() {
  const result = await sqlEnergy`SELECT * FROM audits ORDER BY audit_date DESC`
  return result
}

export async function saveAudit(auditName: string, location: string, auditDate: string) {
  const result = await sqlEnergy`
    INSERT INTO audits (audit_name, location, audit_date) 
    VALUES (${auditName}, ${location}, ${auditDate}) 
    RETURNING audit_id
  `
  return result[0].audit_id
}

export async function saveDevice(
  auditId: number,
  deviceClass: string,
  description: string,
  powerRatingWatts: number,
  quantity: number,
  hoursPerDay: number,
) {
  const result = await sqlEnergy`
    INSERT INTO devices (audit_id, device_class, description, power_rating_watts, quantity, hours_per_day)
    VALUES (${auditId}, ${deviceClass}, ${description}, ${powerRatingWatts}, ${quantity}, ${hoursPerDay})
    RETURNING device_id
  `
  return result[0].device_id
}

export async function getDevicesByAudit(auditId: number) {
  const result = await sqlEnergy`SELECT * FROM devices WHERE audit_id = ${auditId} ORDER BY device_id`
  return result
}

export async function getMetrics(limit = 1000) {
  const result = await sqlMetrics`
    SELECT * FROM metrics_repository 
    ORDER BY timestamp_utc DESC 
    LIMIT ${limit}
  `
  return result
}

export async function ingestMetrics(csvData: string) {
  const lines = csvData.trim().split("\n")
  const insertedIds: number[] = []

  for (const line of lines) {
    if (!line.trim()) continue

    try {
      const [timestamp, computerName, cpuPercent, memPercent, diskBytesSec, inferredWatts] = line
        .split(",")
        .map((v) => v.trim())

      const result = await sqlMetrics`
        INSERT INTO metrics_repository (timestamp_utc, computer_name, cpu_percent, mem_percent_used, disk_bytes_sec, inferred_watts)
        VALUES (${timestamp}, ${computerName}, ${Number.parseFloat(cpuPercent)}, ${Number.parseFloat(memPercent)}, ${Number.parseFloat(diskBytesSec)}, ${Number.parseFloat(inferredWatts)})
        RETURNING id
      `
      insertedIds.push(result[0].id)
    } catch (error) {
      console.error("[v0] Error inserting metric row:", error, "Line:", line)
    }
  }

  return insertedIds
}

export async function getMetricsForAnalysis() {
  const result = await sqlMetrics`
    SELECT * FROM metrics_repository 
    ORDER BY timestamp_utc DESC 
    LIMIT 10000
  `
  return result
}
