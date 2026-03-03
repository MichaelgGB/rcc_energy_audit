"use client"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuditAnalysis from "@/components/dashboard/audit-analysis"
import TelemetryDashboard from "@/components/dashboard/telemetry-dashboard"
import { Zap, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { PageHelp } from "@/components/page-help"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: auditStats, isLoading: auditLoading } = useSWR("/api/audits/stats", fetcher)
  const { data: telemetryStats, isLoading: telemetryLoading } = useSWR("/api/metrics/stats", fetcher)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Energy Dashboard</h1>
            <p className="text-muted mt-2">Real-time monitoring and analysis</p>
          </div>
          <PageHelp title="Dashboard Analytics Guide" description="Understanding your system's performance metrics.">
            <h3 className="font-semibold text-foreground">Purpose of the Dashboard</h3>
            <p>
              The Energy Dashboard serves as the central analytics hub for monitoring and visualizing energy consumption patterns. It aggregates data from both manual audits and real-time telemetry to provide comprehensive insights into your computing infrastructure's energy footprint.
            </p>

            <h3 className="font-semibold text-foreground mt-4">Manual Audits Analysis Tab</h3>
            <p>
              This tab visualizes your static audit data, revealing patterns in your baseline infrastructure:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Total Consumption Overview:</strong> Aggregate daily kWh across all audited locations and devices</li>
              <li><strong>Consumption by Location:</strong> Bar charts showing which physical spaces consume the most energy, helping prioritize intervention areas</li>
              <li><strong>Consumption by Device Class:</strong> Pie chart breaking down energy use by category (Lighting, Computing, HVAC, Servers, Networking) to identify which equipment types dominate your footprint</li>
              <li><strong>Device Type Distribution:</strong> View the mix of equipment across your infrastructure</li>
            </ul>
            <p className="mt-2">
              <strong>Use this analysis to:</strong> Identify which labs need equipment upgrades, determine if HVAC or lighting consumes more than computing loads, and justify budget allocations for energy-efficient replacements.
            </p>

            <h3 className="font-semibold text-foreground mt-4">Telemetry Analysis Tab</h3>
            <p>
              This tab interprets your dynamic log data from real workstations, providing time-based and machine-specific insights:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Idle Waste Detection:</strong> Identifies machines consuming significant power when CPU utilization is below 5%, typically indicating computers left running overnight, over weekends, or during holidays. Each idle device shows estimated annual waste in kWh and cost.</li>
              <li><strong>Peak Power Usage:</strong> Ranks workstations by maximum recorded wattage, helping identify power-hungry configurations that might benefit from hardware tuning or replacement.</li>
              <li><strong>Time-Series Power Curve:</strong> Interactive chart showing aggregate fleet power consumption over hours, days, or weeks. Look for patterns like consistent overnight loads (indicating machines not sleeping) or unexpected weekend spikes.</li>
              <li><strong>CPU Utilization Patterns:</strong> Correlates CPU load with power consumption to validate power models and detect anomalous behavior.</li>
            </ul>
            <p className="mt-2">
              <strong>Actionable insights:</strong> Use idle waste data to justify automatic sleep policies, identify which labs have poor power management practices, and calculate potential savings from behavior changes or hardware upgrades.
            </p>

            <h3 className="font-semibold text-foreground mt-4">How to Use the Dashboard</h3>
            <ol className="list-decimal ml-6 mt-2 space-y-1">
              <li>Start by reviewing the top-level stats cards showing total audits and telemetry data points</li>
              <li>Switch between tabs to compare static infrastructure (audits) with dynamic behavior (telemetry)</li>
              <li>Hover over charts for detailed breakdowns and specific values</li>
              <li>Export insights to present to facilities management or sustainability committees</li>
              <li>Return regularly after uploading new telemetry to track trends over time</li>
            </ol>

            <h3 className="font-semibold text-foreground mt-4">Key Metrics Explained</h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>kWh (Kilowatt-hours):</strong> Energy consumed over time. 1 kWh = running a 100W device for 10 hours</li>
              <li><strong>Inferred Watts:</strong> Estimated instantaneous power draw based on CPU load and hardware specifications</li>
              <li><strong>Idle Percentage:</strong> Proportion of time a machine operates below 5% CPU utilization</li>
              <li><strong>Tariff Rate:</strong> Cost per kWh (default: 16.3 KSh/kWh for Kenya KPLC commercial rates)</li>
            </ul>
          </PageHelp>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Manual Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLoading ? "..." : auditStats?.totalAudits || 0}</div>
              <p className="text-xs text-muted mt-1">audits recorded</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Telemetry Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telemetryLoading ? "..." : telemetryStats?.totalMetrics || 0}</div>
              <p className="text-xs text-muted mt-1">data points collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="audits" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audits">Manual Audits Analysis</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetry Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="audits" className="mt-8">
            <AuditAnalysis />
          </TabsContent>

          <TabsContent value="telemetry" className="mt-8">
            <TelemetryDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
