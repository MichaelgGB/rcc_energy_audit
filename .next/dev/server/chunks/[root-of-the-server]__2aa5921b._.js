module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllAudits",
    ()=>getAllAudits,
    "getAudit",
    ()=>getAudit,
    "getDevicesByAudit",
    ()=>getDevicesByAudit,
    "getMetrics",
    ()=>getMetrics,
    "getMetricsForAnalysis",
    ()=>getMetricsForAnalysis,
    "ingestMetrics",
    ()=>ingestMetrics,
    "query",
    ()=>query,
    "saveAudit",
    ()=>saveAudit,
    "saveDevice",
    ()=>saveDevice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/index.js [app-route] (ecmascript)");
;
const sqlEnergy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: "energy_db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false
});
const sqlMetrics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: "workstation_monitor",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false
});
async function query(text, params) {
    try {
        const result = await sqlEnergy.unsafe(text, params);
        return {
            rows: result
        };
    } catch (error) {
        console.error("[v0] Database query error:", error);
        throw error;
    }
}
async function getAudit(auditId) {
    const result = await sqlEnergy`SELECT * FROM audits WHERE audit_id = ${auditId}`;
    return result[0];
}
async function getAllAudits() {
    const result = await sqlEnergy`SELECT * FROM audits ORDER BY audit_date DESC`;
    return result;
}
async function saveAudit(auditName, location, auditDate) {
    const result = await sqlEnergy`
    INSERT INTO audits (audit_name, location, audit_date) 
    VALUES (${auditName}, ${location}, ${auditDate}) 
    RETURNING audit_id
  `;
    return result[0].audit_id;
}
async function saveDevice(auditId, deviceClass, description, powerRatingWatts, quantity, hoursPerDay) {
    const result = await sqlEnergy`
    INSERT INTO devices (audit_id, device_class, description, power_rating_watts, quantity, hours_per_day)
    VALUES (${auditId}, ${deviceClass}, ${description}, ${powerRatingWatts}, ${quantity}, ${hoursPerDay})
    RETURNING device_id
  `;
    return result[0].device_id;
}
async function getDevicesByAudit(auditId) {
    const result = await sqlEnergy`SELECT * FROM devices WHERE audit_id = ${auditId} ORDER BY device_id`;
    return result;
}
async function getMetrics(limit = 1000) {
    const result = await sqlMetrics`
    SELECT * FROM metrics_repository 
    ORDER BY timestamp_utc DESC 
    LIMIT ${limit}
  `;
    return result;
}
async function ingestMetrics(csvData) {
    const lines = csvData.trim().split("\n");
    const insertedIds = [];
    for (const line of lines){
        if (!line.trim()) continue;
        try {
            const [timestamp, computerName, cpuPercent, memPercent, diskBytesSec, inferredWatts] = line.split(",").map((v)=>v.trim());
            const result = await sqlMetrics`
        INSERT INTO metrics_repository (timestamp_utc, computer_name, cpu_percent, mem_percent_used, disk_bytes_sec, inferred_watts)
        VALUES (${timestamp}, ${computerName}, ${Number.parseFloat(cpuPercent)}, ${Number.parseFloat(memPercent)}, ${Number.parseFloat(diskBytesSec)}, ${Number.parseFloat(inferredWatts)})
        RETURNING id
      `;
            insertedIds.push(result[0].id);
        } catch (error) {
            console.error("[v0] Error inserting metric row:", error, "Line:", line);
        }
    }
    return insertedIds;
}
async function getMetricsForAnalysis() {
    const result = await sqlMetrics`
    SELECT * FROM metrics_repository 
    ORDER BY timestamp_utc DESC 
    LIMIT 10000
  `;
    return result;
}
}),
"[project]/app/api/recommendations/compute/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        // Get all metrics from the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        // Fetch raw telemetry data
        const metricsData = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMetricsForAnalysis"]();
        if (!metricsData || metricsData.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                recommendations: [],
                summary: "No telemetry data available for analysis"
            });
        }
        // Analyze patterns and generate recommendations
        const recommendations = generateEnergyRecommendations(metricsData);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            recommendations,
            dataPoints: metricsData.length,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("[v0] Error computing recommendations:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to compute recommendations"
        }, {
            status: 500
        });
    }
}
function generateEnergyRecommendations(metricsData) {
    const recommendations = [];
    // Group by computer
    const computerStats = new Map();
    metricsData.forEach((metric)=>{
        const computer = metric.computer_name;
        const watts = Number.parseFloat(metric.inferred_watts) || 0;
        const cpu = Number.parseFloat(metric.cpu_percent) || 0;
        if (!computerStats.has(computer)) {
            computerStats.set(computer, {
                avgWatts: 0,
                maxWatts: 0,
                samples: 0,
                idleCount: 0,
                peakHours: new Set()
            });
        }
        const stats = computerStats.get(computer);
        stats.samples++;
        stats.avgWatts += watts;
        stats.maxWatts = Math.max(stats.maxWatts, watts);
        if (cpu < 5) stats.idleCount++;
        const hour = new Date(metric.timestamp_utc).getHours();
        if (watts > 300) stats.peakHours.add(hour.toString());
    });
    // Normalize averages
    computerStats.forEach((stats)=>{
        stats.avgWatts = stats.avgWatts / stats.samples;
    });
    // Generate recommendations based on analysis
    const affectedDevices = Array.from(computerStats.keys());
    // 1. Idle Waste Detection
    let totalIdleWaste = 0;
    const idleDevices = [];
    computerStats.forEach((stats, computer)=>{
        const idlePercent = stats.idleCount / stats.samples * 100;
        if (idlePercent > 30) {
            idleDevices.push(computer);
            totalIdleWaste += stats.avgWatts * 0.3 * 24; // 30% idle * 24 hours
        }
    });
    if (idleDevices.length > 0) {
        recommendations.push({
            priority: "high",
            category: "Idle Management",
            title: "Implement Automated Sleep Schedules",
            description: `${idleDevices.length} workstations show idle usage over 30% of the time. Enable aggressive sleep mode and auto-shutdown policies during non-business hours.`,
            estimatedSavings: totalIdleWaste * 0.6,
            affectedDevices: idleDevices,
            action: "Configure BIOS and OS power settings, enable Wake-on-LAN for morning boot-up"
        });
    }
    // 2. Peak Shaving
    const peakHours = new Map();
    computerStats.forEach((stats)=>{
        stats.peakHours.forEach((hour)=>{
            peakHours.set(hour, (peakHours.get(hour) || 0) + 1);
        });
    });
    if (peakHours.size > 0) {
        const maxPeakHour = Array.from(peakHours.entries()).sort((a, b)=>b[1] - a[1])[0];
        const devicesInPeak = maxPeakHour[1];
        recommendations.push({
            priority: "medium",
            category: "Load Balancing",
            title: "Stagger Usage During Peak Hours",
            description: `Power consumption spikes during hour ${maxPeakHour[0]}:00 with ${devicesInPeak} workstations. Stagger lunch breaks and scheduled tasks to reduce simultaneous usage.`,
            estimatedSavings: 50 * devicesInPeak * 1,
            affectedDevices: affectedDevices,
            action: "Create staggered usage schedule; move batch processing to off-peak hours"
        });
    }
    // 3. High Power Devices
    const highPowerDevices = Array.from(computerStats.entries()).filter(([_, stats])=>stats.avgWatts > 200).map(([computer])=>computer);
    if (highPowerDevices.length > 0) {
        recommendations.push({
            priority: "medium",
            category: "Hardware Efficiency",
            title: "Upgrade High-Power Workstations",
            description: `${highPowerDevices.length} workstations exceed 200W average consumption. These are power-inefficient models suitable for replacement with modern, energy-efficient alternatives.`,
            estimatedSavings: 200 * highPowerDevices.length * 8 * 250 / 1000,
            affectedDevices: highPowerDevices,
            action: "Audit hardware; prioritize replacement of systems over 5 years old"
        });
    }
    // 4. Continuous Monitoring
    if (metricsData.length > 100) {
        recommendations.push({
            priority: "low",
            category: "Best Practices",
            title: "Establish Energy Dashboard for Staff",
            description: "Staff awareness of energy consumption can reduce usage by 5-15%. Create a public dashboard showing real-time consumption vs targets.",
            estimatedSavings: 100,
            affectedDevices: affectedDevices,
            action: "Deploy public-facing energy dashboard; share bi-weekly reports"
        });
    }
    return recommendations;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2aa5921b._.js.map