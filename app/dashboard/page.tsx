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
          <PageHelp title="How to Use the Dashboard" description="Quick guide to reading your energy data.">
            <h3 className="font-semibold text-foreground">📊 Manual Audits Tab</h3>
            <p>Shows charts built from the device entries you've created on the <strong>Audit</strong> page. Use this to understand your static infrastructure — does HVAC cost more than lighting? Which lab is the most power-hungry?</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li><strong>Consumption by Location:</strong> Click a bar to see which specific lab is your largest consumer.</li>
              <li><strong>Device Class Pie:</strong> Is "Servers" taking up half the pie? That's your biggest optimization lever.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">📡 Telemetry Tab</h3>
            <p>This tab only populates after you've uploaded a <code>.csv</code> file on the <strong>Audit → Upload Telemetry</strong> tab. It shows real behavior from actual machines.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li><strong>Idle Waste:</strong> Any machine spending most of its time below 5% CPU is wasting power. These are sleep policy targets.</li>
              <li><strong>Peak Power:</strong> Machines at the top of this list are candidates for the Simulation tool — compare them against replacements.</li>
              <li><strong>Time-Series Curve:</strong> A flat line overnight means machines aren't sleeping. A spike on weekends might mean unauthorized use.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">💡 Tips</h3>
            <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
              <li>If charts are empty — go to <strong>Audit</strong> and add devices or upload telemetry data first.</li>
              <li>The two stat cards at the top refresh automatically. If they show zero, no data has been uploaded yet.</li>
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
