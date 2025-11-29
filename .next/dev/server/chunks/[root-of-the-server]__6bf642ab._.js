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
    "ingestMetrics",
    ()=>ingestMetrics,
    "query",
    ()=>query,
    "saveAudit",
    ()=>saveAudit,
    "saveDevice",
    ()=>saveDevice
]);
(()=>{
    const e = new Error("Cannot find module 'postgres'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
const sqlEnergy = postgres({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: "energy_db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : false
});
const sqlMetrics = postgres({
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
async function saveDevice(auditId, deviceClass, description, powerRatingWatts, quantity, hoursPerDay, dailyKwhTotal) {
    const result = await sqlEnergy`
    INSERT INTO devices (audit_id, device_class, description, power_rating_watts, quantity, hours_per_day, daily_kwh_total)
    VALUES (${auditId}, ${deviceClass}, ${description}, ${powerRatingWatts}, ${quantity}, ${hoursPerDay}, ${dailyKwhTotal})
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
}),
"[project]/app/api/audits/list/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const audits = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllAudits"]();
        // Fetch devices for each audit
        const auditsWithDevices = await Promise.all(audits.map(async (audit)=>{
            const devices = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDevicesByAudit"](audit.audit_id);
            return {
                ...audit,
                devices
            };
        }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(auditsWithDevices);
    } catch (error) {
        console.error("[v0] Error fetching audits:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch audits"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6bf642ab._.js.map