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
                    <PageHelp title="How to Read the Carbon Report" description="Understanding your environmental footprint.">
                        <h3 className="font-semibold text-foreground">🌍 What This Page Shows</h3>
                        <p className="text-sm">This report combines all your audit and telemetry data into a single environmental picture. It answers the question: <em>"How much CO₂ is our lab infrastructure emitting per year?"</em></p>

                        <h3 className="font-semibold text-foreground mt-4">📊 The 4 Summary Cards</h3>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li><strong>Total Annual Carbon:</strong> The total CO₂ your infrastructure emits each year, combining both audit and telemetry data. Shown in kg or tonnes (1 tonne = 1000 kg).</li>
                            <li><strong>Total Annual Energy:</strong> The kWh your infrastructure consumes per year across all sources.</li>
                            <li><strong>Trees to Offset 🌳:</strong> How many mature trees would need to grow for a full year to absorb this CO₂. Each tree absorbs ~21 kg/year. Useful for communicating impact to non-technical audiences or campus sustainability boards.</li>
                            <li><strong>Carbon Factor:</strong> The grid efficiency factor used in calculations. Kenya's default is <strong>0.4 kg CO₂/kWh</strong> — lower than most countries due to geothermal and hydro. If your grid becomes dirtier (e.g., more diesel in drought), update this in the Simulations settings.</li>
                        </ul>

                        <h3 className="font-semibold text-foreground mt-4">📈 The Two Charts</h3>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li><strong>Carbon by Location (Pie):</strong> Which labs or spaces are emitting the most. "Active Workstations (Telemetry)" is the footprint from your uploaded CSV data.</li>
                            <li><strong>Emissions by Device Class (Bar):</strong> Is HVAC or Lighting dominating? Use this to decide where to invest first — e.g., if Servers are largest, check your Simulations page for replacement options.</li>
                        </ul>

                        <h3 className="font-semibold text-foreground mt-4">💡 Tips</h3>
                        <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
                            <li>If the charts are empty, add audits on the <strong>Audit</strong> page first.</li>
                            <li>Use the "Trees to Offset" number for grant applications or student sustainability campaigns — it's easier to communicate than raw CO₂ kilograms.</li>
                            <li>After implementing changes from the <strong>Recommendations</strong> page, come back here to see if the carbon numbers have dropped.</li>
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
