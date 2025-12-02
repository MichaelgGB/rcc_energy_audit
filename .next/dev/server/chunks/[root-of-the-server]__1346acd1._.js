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
"[project]/app/api/simulations/calculate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
function calculateEnergyConsumption(device, includeUncertainty, degradationRate) {
    const { idleHours, normalHours, peakHours } = device.usage;
    const units = device.units || 1;
    const dailyIdleKwh = device.idlePower * idleHours * units / 1000;
    const dailyNormalKwh = device.normalPower * normalHours * units / 1000;
    const dailyPeakKwh = device.peakPower * peakHours * units / 1000;
    const annualKwh = (dailyIdleKwh + dailyNormalKwh + dailyPeakKwh) * 365;
    let lifetimeKwh = annualKwh * device.lifespan;
    if (includeUncertainty && device.age > 0) {
        const degradationFactor = 1 - degradationRate / 100 * device.age;
        lifetimeKwh *= degradationFactor;
    }
    return {
        annualKwh: Math.round(annualKwh * 100) / 100,
        lifetimeKwh: Math.round(lifetimeKwh * 100) / 100,
        idleKwh: Math.round(dailyIdleKwh * 365 * 100) / 100,
        normalKwh: Math.round(dailyNormalKwh * 365 * 100) / 100,
        peakKwh: Math.round(dailyPeakKwh * 365 * 100) / 100
    };
}
function calculateTCO(device, annualKwh, tariff) {
    const energyCost = annualKwh * device.lifespan * tariff;
    const maintenanceCostTotal = device.maintenanceCost * device.lifespan;
    const tco = device.purchaseCost + energyCost + maintenanceCostTotal;
    return Math.round(tco * 100) / 100;
}
function calculateUncertaintyScore(deviceA, deviceB, includeUncertainty) {
    if (!includeUncertainty) return 100;
    let penalties = 0;
    // Age penalty
    penalties += Math.min(deviceA.age * 5 + deviceB.age * 5, 20);
    // Missing usage data penalty
    const aUsageGap = deviceA.usage.idleHours + deviceA.usage.normalHours + deviceA.usage.peakHours;
    const bUsageGap = deviceB.usage.idleHours + deviceB.usage.normalHours + deviceB.usage.peakHours;
    if (aUsageGap === 0 || bUsageGap === 0) penalties += 15;
    if (aUsageGap > 24 || bUsageGap > 24) penalties += 10;
    return Math.max(0, 100 - penalties);
}
async function POST(req) {
    try {
        const body = await req.json();
        const { deviceA, deviceB, tariff, carbonFactor, degradationRate, includeUncertainty } = body;
        // Validate inputs
        if (!deviceA || !deviceB || tariff <= 0 || carbonFactor <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid input parameters"
            }, {
                status: 400
            });
        }
        // Calculate energy consumption
        const energyA = calculateEnergyConsumption(deviceA, includeUncertainty, degradationRate);
        const energyB = calculateEnergyConsumption(deviceB, includeUncertainty, degradationRate);
        // Calculate TCO
        const TCOA = calculateTCO(deviceA, energyA.annualKwh, tariff);
        const TCOB = calculateTCO(deviceB, energyB.annualKwh, tariff);
        // Calculate break-even
        const capitalCostDifference = Math.abs(deviceB.purchaseCost - deviceA.purchaseCost);
        const annualSavings = (energyA.annualKwh - energyB.annualKwh) * tariff;
        const breakEvenMonths = annualSavings > 0 ? Math.round(capitalCostDifference / annualSavings * 12 * 100) / 100 : -1;
        // Calculate carbon footprint
        const carbonA = Math.round(energyA.annualKwh * carbonFactor * 100) / 100;
        const carbonB = Math.round(energyB.annualKwh * carbonFactor * 100) / 100;
        // Calculate uncertainty
        const uncertaintyScore = calculateUncertaintyScore(deviceA, deviceB, includeUncertainty);
        const result = {
            energyA,
            energyB,
            TCOA,
            TCOB,
            breakEvenMonths,
            carbonA,
            carbonB,
            uncertaintyScore,
            savings: {
                energyPerYear: Math.round((energyA.annualKwh - energyB.annualKwh) * 100) / 100,
                costPerYear: Math.round((annualSavings - (deviceB.maintenanceCost - deviceA.maintenanceCost)) * 100) / 100,
                carbonPerYear: Math.round((carbonA - carbonB) * 100) / 100
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error("[v0] Simulation calculation error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Calculation failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1346acd1._.js.map