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
"[project]/app/api/audits/save/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { audit_name, location, devices } = body;
        if (!audit_name || !devices || devices.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "audit_name and devices are required"
            }, {
                status: 400
            });
        }
        // Insert audit
        const auditId = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveAudit"](audit_name, location || "Unknown", new Date().toISOString());
        console.log("[v0] Saved audit:", auditId);
        // Insert each device
        for (const device of devices){
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveDevice"](auditId, device.device_class, device.description, device.power_rating_watts, device.quantity, device.hours_per_day);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            audit_id: auditId
        });
    } catch (error) {
        console.error("[v0] Error saving audit:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to save audit to database"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bd1c7285._.js.map