"use client"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuditAnalysis from "@/components/dashboard/audit-analysis"
import TelemetryDashboard from "@/components/dashboard/telemetry-dashboard"
import { Zap, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: auditStats, isLoading: auditLoading } = useSWR("/api/audits/stats", fetcher)
  const { data: telemetryStats, isLoading: telemetryLoading } = useSWR("/api/metrics/stats", fetcher)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Energy Dashboard</h1>
            <p className="text-muted mt-2">Real-time monitoring and analysis</p>
          </div>
          <Link href="/predictions">
            <Button className="gap-2">
              <TrendingDown className="w-4 h-4" />
              View Predictions
            </Button>
          </Link>
          <Link href="/recommendations">
            <Button className="gap-2">
              <TrendingDown className="w-4 h-4" />
              View Recommendations
            </Button>
          </Link>
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
