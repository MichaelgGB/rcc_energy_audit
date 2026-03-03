"use client"

import { useEffect, useState } from "react"
import {
    AlertCircle,
    Leaf,
    TrendingDown,
    Activity,
    BarChart3,
    PieChart as PieChartIcon,
    TreePine
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]

interface CarbonSummary {
    totalDailyKwh: number
    annualKwh: number
    totalAnnualCarbonKg: number
    treesEquivalent: number
    carbonFactorUsed: number
}

interface LocationBreakdown {
    location: string
    dailyKwh: number
    annualCarbonKg: number
}

interface DeviceBreakdown {
    deviceClass: string
    dailyKwh: number
    annualCarbonKg: number
}

interface TelemetryReport {
    activeComputers: number
    estimatedDailyKwh: number
    estimatedAnnualCarbonKg: number
}

interface CarbonReportData {
    summary: CarbonSummary
    breakdowns: {
        byLocation: LocationBreakdown[]
        byDeviceClass: DeviceBreakdown[]
        telemetry: TelemetryReport
    }
}

import { PageHelp } from "@/components/page-help"

export default function SystemWideCarbonReportPage() {
    const [data, setData] = useState<CarbonReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchReport() {
            try {
                const response = await fetch("/api/reports/carbon")
                if (!response.ok) {
                    throw new Error("Failed to fetch carbon report data")
                }
                const json = await response.json()
                setData(json)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchReport()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <div className="text-center space-y-4">
                    <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto" />
                    <h2 className="text-xl font-medium">Calculating System-wide Impact...</h2>
                    <p className="text-muted-foreground w-64 mx-auto">Querying manual audits and real-time telemetry metrics.</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Report</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button className="mt-6" onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    if (!data) return null

    // Ensure charts have safe data to work with
    const locationData = data.breakdowns.byLocation.map((item) => ({
        name: item.location,
        value: item.annualCarbonKg
    }))

    const deviceData = data.breakdowns.byDeviceClass.map((item) => ({
        name: item.deviceClass,
        value: item.annualCarbonKg
    }))

    // Add telemetry to location data conceptually for visualizing active workstations vs static labs
    const combinedCarbonData = [
        ...locationData,
        { name: "Active Workstations (Telemetry)", value: data.breakdowns.telemetry.estimatedAnnualCarbonKg }
    ].filter(d => d.value > 0)

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-bold">System-wide Carbon Footprint</h1>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Aggregated environmental impact report crossing manual infrastructural audits and live telemetry streams.
                        </p>
                    </div>
                    <PageHelp title="Carbon Report Guide" description="Computing macro-environmental footprints.">
                        <h3 className="font-semibold text-foreground">What is the Carbon Report?</h3>
                        <p>
                            The System-wide Carbon Report provides a comprehensive environmental impact assessment by aggregating all energy consumption data across your infrastructure. It synthesizes manual audit data (static baseline) with real-time telemetry (dynamic workloads) to calculate total carbon dioxide emissions attributable to your computing operations.
                        </p>

                        <h3 className="font-semibold text-foreground mt-4">Calculation Methodology</h3>
                        <p>
                            This report combines data from two distinct measurement layers:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Manual Audits Layer:</strong> Captures expected infrastructural load including lighting, HVAC (cooling/heating), servers, networking equipment, and peripheral devices. These are typically constant or follow predictable schedules.</li>
                            <li><strong>Active Telemetry Layer:</strong> Measures real-time power consumption from instrumented workstations (desktops, laptops). Telemetry provides actual usage patterns including idle periods, peak loads, and variation across time-of-day and days-of-week.</li>
                        </ul>
                        <p className="mt-2">
                            <strong>Carbon Calculation Formula:</strong> Total Carbon (kg CO₂) = Total Energy Consumption (kWh) × Grid Carbon Intensity Factor (kg CO₂/kWh)
                        </p>
                        <p className="mt-2">
                            The system extrapolates daily consumption to annual footprints (Daily kWh × 365 days) to provide yearly projections for sustainability planning and reporting.
                        </p>

                        <h3 className="font-semibold text-foreground mt-4">Kenya Grid Carbon Intensity</h3>
                        <p>
                            The default carbon intensity factor is <strong>0.4 kg CO₂ per kWh</strong>, reflecting Kenya's relatively clean electricity grid composition:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Geothermal:</strong> ~47% of grid capacity (Olkaria geothermal complex, negligible emissions)</li>
                            <li><strong>Hydroelectric:</strong> ~30% (renewable, near-zero emissions during operation)</li>
                            <li><strong>Thermal (Diesel/Heavy Fuel):</strong> ~15% (high carbon intensity, primarily used during droughts)</li>
                            <li><strong>Wind/Solar:</strong> ~8% and growing (zero emissions)</li>
                        </ul>
                        <p className="mt-2">
                            This makes Kenya's grid significantly cleaner than global averages (~0.5-0.6 kg CO₂/kWh) but dirtier than countries with predominantly renewable/nuclear grids (France: 0.06, Norway: 0.02). The factor can be adjusted in Simulations settings if grid composition changes or for hypothetical scenarios.
                        </p>

                        <h3 className="font-semibold text-foreground mt-4">Understanding Report Sections</h3>

                        <h4 className="font-semibold text-foreground mt-3">1. Summary Cards</h4>
                        <p>
                            Top-level metrics provide at-a-glance insights:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Total Daily Consumption:</strong> Combined kWh from all sources (audits + telemetry) per day</li>
                            <li><strong>Annual Projection:</strong> Daily consumption scaled to yearly total for long-term planning</li>
                            <li><strong>Annual Carbon Footprint:</strong> Total kg CO₂ emitted over a year, often converted to metric tonnes (1 tonne = 1000 kg) for reporting</li>
                            <li><strong>Trees Required to Offset:</strong> Number of mature trees needed to absorb this CO₂ over one year (based on 21 kg CO₂/tree/year absorption rate)</li>
                        </ul>

                        <h4 className="font-semibold text-foreground mt-3">2. Breakdown by Location</h4>
                        <p>
                            Visual and tabular analysis showing carbon emissions attributed to specific physical locations:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Bar Chart:</strong> Compare locations side-by-side to identify highest-impact facilities</li>
                            <li><strong>Use Case:</strong> Prioritize energy efficiency upgrades in locations with highest footprints, justify lab-specific interventions</li>
                            <li><strong>Example Insights:</strong> "PHD Lab emits 3x more carbon than Undergraduate Lab despite similar square footage" → investigate cooling inefficiency or overcapacity</li>
                        </ul>

                        <h4 className="font-semibold text-foreground mt-3">3. Breakdown by Device Class</h4>
                        <p>
                            Categorizes emissions by equipment type to reveal infrastructure composition impacts:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Pie Chart:</strong> Proportional view of carbon contributions (e.g., "Computing: 45%, HVAC: 30%, Lighting: 15%")</li>
                            <li><strong>Use Case:</strong> Guide strategic investments (e.g., if HVAC dominates, investigate cooling optimization; if Lighting is significant, prioritize LED conversions)</li>
                            <li><strong>Benchmarking:</strong> Compare your device class distribution against industry standards to identify anomalies</li>
                        </ul>

                        <h4 className="font-semibold text-foreground mt-3">4. Telemetry-Specific Insights</h4>
                        <p>
                            Separate card for real-time workstation data:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Active Computers Count:</strong> Unique machines with recent telemetry uploads</li>
                            <li><strong>Estimated Daily kWh:</strong> Extrapolated consumption from telemetry sampling</li>
                            <li><strong>Estimated Annual Carbon:</strong> Environmental impact of just the workstation fleet</li>
                        </ul>
                        <p className="mt-2">
                            Note: Telemetry typically covers only instrumented machines (desktops/laptops with monitoring agents). Infrastructure devices (lighting, servers, HVAC) are captured via manual audits.
                        </p>

                        <h3 className="font-semibold text-foreground mt-4">Equivalent Metrics Explained</h3>
                        <p>
                            The report translates technical kWh and CO₂ figures into relatable real-world equivalents:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Trees to Offset:</strong> Based on mature tree CO₂ absorption (~21 kg/year). Example: 500 tonnes CO₂ requires 23,810 trees growing for one year to neutralize.</li>
                            <li><strong>Water Consumption:</strong> Thermal power generation uses ~3 liters of water per kWh for cooling. Reducing energy demand conserves this water resource.</li>
                            <li><strong>Coal Equivalent:</strong> 1 kWh ≈ 0.4 kg of coal combustion. Shows fossil fuel avoided by efficiency improvements.</li>
                            <li><strong>Vehicle Emissions:</strong> (If implemented) Average car emits ~120 g CO₂/km. Your annual footprint equivalent to X km driven.</li>
                        </ul>
                        <p className="mt-2">
                            These translations are valuable for communicating with non-technical audiences (administration, students, community) and for public sustainability commitments.
                        </p>

                        <h3 className="font-semibold text-foreground mt-4">Use Cases for Carbon Reports</h3>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>ESG Reporting:</strong> Environmental, Social, Governance disclosures for institutional reporting (e.g., University sustainability initiatives, accreditation requirements)</li>
                            <li><strong>Carbon Offsetting:</strong> Calculate how many carbon credits to purchase or trees to plant to achieve carbon neutrality</li>
                            <li><strong>Grant Applications:</strong> Demonstrate environmental impact of proposed projects (e.g., "This upgrade will reduce emissions by 50 tonnes CO₂ annually")</li>
                            <li><strong>Public Communication:</strong> Share achievements in sustainability reports, websites, social media ("UON reduced carbon footprint by 30% in 2026")</li>
                            <li><strong>Regulatory Compliance:</strong> Some jurisdictions require carbon footprint reporting for public institutions</li>
                            <li><strong>Benchmarking:</strong> Compare your carbon intensity (kg CO₂ per student or per square meter) against peer institutions</li>
                            <li><strong>Internal Accountability:</strong> Set departmental carbon budgets and track compliance</li>
                        </ul>

                        <h3 className="font-semibold text-foreground mt-4">Improving Report Accuracy</h3>
                        <p>
                            To maximize data quality and report usefulness:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Complete Audits:</strong> Ensure all labs, offices, and support spaces are audited with accurate device inventories</li>
                            <li><strong>Representative Telemetry:</strong> Deploy monitoring on at least 20-30% of machines per lab to capture usage diversity</li>
                            <li><strong>Regular Updates:</strong> Re-audit annually and upload new telemetry monthly to reflect infrastructure changes</li>
                            <li><strong>Calibrate Carbon Factor:</strong> Adjust grid carbon intensity seasonally if your region experiences significant generation mix changes (e.g., more diesel during droughts)</li>
                            <li><strong>Include All Sources:</strong> Don't forget non-computing loads like data center cooling, cafeteria equipment, research instruments</li>
                        </ul>

                        <h3 className="font-semibold text-foreground mt-4">Interpreting Trends</h3>
                        <p>
                            Compare carbon reports over time to track progress:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li><strong>Decreasing Footprint:</strong> Success! Investigate which interventions (recommendations, hardware upgrades) drove reductions and scale them</li>
                            <li><strong>Stable Footprint:</strong> Consider whether this is acceptable given organizational growth, or if more aggressive action is needed</li>
                            <li><strong>Increasing Footprint:</strong> Identify causes (new labs, increased usage, degraded efficiency) and develop mitigation plans</li>
                            <li><strong>Seasonal Variations:</strong> Expect higher carbon during exam periods (intensive machine use) and January/August (cooling demands during hot months)</li>
                        </ul>

                        <h3 className="font-semibold text-foreground mt-4">Exporting and Sharing</h3>
                        <p>
                            While the platform displays visualizations, consider these sharing strategies:
                        </p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Take screenshots of charts and tables for presentations and reports</li>
                            <li>Copy summary statistics for inclusion in sustainability dashboards</li>
                            <li>Present location and device class breakdowns to facilities committees to justify targeted investments</li>
                            <li>Share "trees needed" metric with student organizations to organize campus tree-planting drives matching the carbon footprint</li>
                        </ul>
                    </PageHelp>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Top Level Summary Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Leaf className="w-4 h-4" /> Total Annual Carbon
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {data.summary.totalAnnualCarbonKg > 1000
                                    ? (data.summary.totalAnnualCarbonKg / 1000).toFixed(2) + " t"
                                    : data.summary.totalAnnualCarbonKg.toLocaleString() + " kg"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">CO₂ equivalent emissions per year</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Total Annual Energy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-accent">
                                {Math.round(data.summary.annualKwh).toLocaleString()} <span className="text-lg">kWh</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Combined system consumption</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TreePine className="w-4 h-4 text-emerald-500" /> Trees to Offset
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-500">
                                {Math.round(data.summary.treesEquivalent).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Mature trees required annually</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingDown className="w-4 h-4" /> Carbon Factor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {data.summary.carbonFactorUsed}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">kg CO₂/kWh (Grid Average)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Location Breakdown Pie */}
                    <Card className="bg-card border-border">
                        <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-primary" />
                                Carbon Distribution by Location
                            </CardTitle>
                            <CardDescription>Includes static audits and dynamic telemetry</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] pt-6">
                            {combinedCarbonData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={combinedCarbonData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={130}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {combinedCarbonData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number) => [`${Math.round(value).toLocaleString()} kg CO₂`, 'Annual Carbon']}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No location data available to visualize.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Device Breakdown Bar */}
                    <Card className="bg-card border-border">
                        <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-accent" />
                                Emissions by Device Class
                            </CardTitle>
                            <CardDescription>Comparing infrastructure categories</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] pt-6">
                            {deviceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={deviceData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(value) => `${value}`} />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--foreground))' }} />
                                        <RechartsTooltip
                                            formatter={(value: number) => [`${Math.round(value).toLocaleString()} kg CO₂`, 'Annual Carbon']}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                        />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                            {deviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No device data available to visualize.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Deep Dive Tables/Insights */}
                <Card className="bg-card border-border">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-lg font-medium">Detailed Sub-systems Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Live Telemetry Footprint</h4>
                                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Active Monitored Nodes</p>
                                        <p className="text-xl font-bold">{data.breakdowns.telemetry.activeComputers}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Est. Daily Impact</p>
                                        <p className="text-xl font-bold">{data.breakdowns.telemetry.estimatedDailyKwh} kWh</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Annual Carbon Projection</p>
                                        <p className="text-xl font-bold">{data.breakdowns.telemetry.estimatedAnnualCarbonKg.toLocaleString()} kg CO₂</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </main>
        </div>
    )
}
