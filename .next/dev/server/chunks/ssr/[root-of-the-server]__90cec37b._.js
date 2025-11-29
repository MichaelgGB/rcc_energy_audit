module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/recommendations/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/recommendations/compute/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-rsc] (ecmascript)");
;
async function GET() {
    try {
        const telemetryData = await fetchTelemetryData();
        if (!telemetryData || telemetryData.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                recommendations: []
            });
        }
        const metrics = calculateMetrics(telemetryData);
        // This now calls the new Gemini-powered function
        const recommendations = await analyzeWithAI(metrics);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
            recommendations
        });
    } catch (error) {
        console.error("Error computing recommendations:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to compute recommendations"
        }, {
            status: 500
        });
    }
}
// --- DATA FETCHING (No changes needed here) ---
async function fetchTelemetryData() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/metrics/recent`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch telemetry data');
    }
    const data = await response.json();
    return data.metrics || [];
}
// --- METRICS CALCULATION (No changes needed here) ---
function calculateMetrics(data) {
    // ... (This entire function remains exactly the same)
    const deviceGroups = data.reduce((acc, record)=>{
        if (!acc[record.computer_name]) {
            acc[record.computer_name] = [];
        }
        acc[record.computer_name].push(record);
        return acc;
    }, {});
    const deviceStats = Object.entries(deviceGroups).map(([name, records])=>{
        const avgCPU = records.reduce((sum, r)=>sum + r.cpu_percent, 0) / records.length;
        const avgMem = records.reduce((sum, r)=>sum + r.mem_percent_used, 0) / records.length;
        const avgWatts = records.reduce((sum, r)=>sum + r.inferred_watts, 0) / records.length;
        const maxWatts = Math.max(...records.map((r)=>r.inferred_watts));
        const minWatts = Math.min(...records.map((r)=>r.inferred_watts));
        return {
            name,
            recordCount: records.length,
            avgCPU: Math.round(avgCPU * 100) / 100,
            avgMem: Math.round(avgMem * 100) / 100,
            avgWatts: Math.round(avgWatts * 100) / 100,
            maxWatts: Math.round(maxWatts * 100) / 100,
            minWatts: Math.round(minWatts * 100) / 100
        };
    });
    const totalDevices = Object.keys(deviceGroups).length;
    const totalRecords = data.length;
    const avgCPUAllDevices = deviceStats.reduce((sum, d)=>sum + d.avgCPU, 0) / totalDevices;
    const avgWattsAllDevices = deviceStats.reduce((sum, d)=>sum + d.avgWatts, 0) / totalDevices;
    return {
        totalDevices,
        totalRecords,
        avgCPUAllDevices: Math.round(avgCPUAllDevices * 100) / 100,
        avgWattsAllDevices: Math.round(avgWattsAllDevices * 100) / 100,
        deviceStats,
        timeRange: {
            start: data[0]?.timestamp_utc,
            end: data[data.length - 1]?.timestamp_utc
        }
    };
}
// ===================================================================
//                MODIFIED: AI Analysis with Google Gemini
// ===================================================================
async function analyzeWithAI(metrics) {
    // The Gemini API endpoint for the v1.5 Flash model.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1.5/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;
    // The prompt is largely the same, but tailored slightly for Gemini's JSON mode instructions.
    const prompt = `You are an expert energy efficiency analyst for a Responsible Computing Center (RCC) audit. Analyze the provided telemetry data summary and generate actionable energy optimization recommendations.

TELEMETRY SUMMARY:
- Total Devices: ${metrics.totalDevices}
- Total Data Points: ${metrics.totalRecords}
- Average CPU Usage Across All Devices: ${metrics.avgCPUAllDevices}%
- Average Power Consumption Across All Devices: ${metrics.avgWattsAllDevices}W
- Time Range of Data: ${metrics.timeRange.start} to ${metrics.timeRange.end}

DETAILED DEVICE STATISTICS:
${metrics.deviceStats.map((d)=>`  - Device: ${d.name}, Records: ${d.recordCount}, Avg CPU: ${d.avgCPU}%, Avg Power: ${d.avgWatts}W, Power Range: ${d.minWatts}W - ${d.maxWatts}W`).join('\n')}

YOUR TASK:
Based on the data, identify key optimization opportunities. Follow these analysis guidelines:
1.  **Idle Waste:** Find devices with high average power consumption (>70W) but low average CPU usage (<15%). These are prime candidates for power management.
2.  **Sleep Scheduling:** Identify devices with consistent usage patterns that would benefit from scheduled sleep or shutdown during off-hours.
3.  **Hardware Inefficiency:** Spot any devices that have a significantly higher average power consumption compared to others with similar CPU usage, suggesting they are older or less efficient models.

OUTPUT INSTRUCTIONS:
You MUST return a valid JSON array of recommendation objects. Do not include markdown code blocks or any other text outside of the JSON array. Each object in the array must conform to the following schema:
- "priority": A string, one of "critical", "high", "medium", "low".
- "category": A string, one of "Idle Management", "Hardware Efficiency", "Best Practices".
- "title": A concise string (max 60 characters).
- "description": A detailed string explaining the problem and the proposed solution (2-3 sentences).
- "estimatedSavings": A number representing the estimated annual kWh savings.
- "affectedDevices": An array of strings, listing the computer names.
- "action": A string detailing the specific implementation steps.

Example of a valid response:
[
  {
    "priority": "high",
    "category": "Idle Management",
    "title": "Enable Aggressive Sleep on Idle Workstations",
    "description": "Devices 'CSLAB-PC-01' and 'CSLAB-PC-05' show high power draw while having very low CPU usage, indicating significant idle time. Implementing a system-wide policy to put these machines to sleep after 20 minutes of inactivity can lead to major savings.",
    "estimatedSavings": 250,
    "affectedDevices": ["CSLAB-PC-01", "CSLAB-PC-05"],
    "action": "Using Group Policy (GPO) or a local script, set the 'Turn off display' and 'Put computer to sleep' timers to 20 minutes for the affected devices."
  }
]

Now, generate the recommendations based on the provided data.`;
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Gemini uses 'contents' instead of 'messages'
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                // Gemini's configuration for forcing JSON output
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        });
        if (!response.ok) {
            // It's helpful to log the response body if the API returns an error
            const errorBody = await response.json();
            console.error("Gemini API error response:", errorBody);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // The JSON response from Gemini is located in the 'text' property of the first candidate's content part.
        const aiResponseText = data.candidates[0].content.parts[0].text;
        // With JSON mode, parsing is more reliable, but a try-catch is still good practice.
        let recommendations;
        try {
            recommendations = JSON.parse(aiResponseText);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON response:", aiResponseText);
            throw new Error("Invalid JSON format from AI response");
        }
        // You can still keep the validation filter for extra safety
        return recommendations.filter((rec)=>{
            return rec.priority && rec.category && rec.title && rec.description && typeof rec.estimatedSavings === "number" && Array.isArray(rec.affectedDevices) && rec.action;
        });
    } catch (error) {
        console.error("Gemini AI analysis error:", error);
        return []; // Return an empty array on failure so the frontend doesn't break
    }
}
}),
"[project]/app/recommendations/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/recommendations/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__90cec37b._.js.map