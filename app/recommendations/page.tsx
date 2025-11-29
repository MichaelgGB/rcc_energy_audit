"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, Lightbulb, CheckCircle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  description: string
  estimatedSavings: number
  affectedDevices: string[]
  action: string
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations/compute")
        if (!response.ok) throw new Error("Failed to fetch recommendations")
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 border-red-500/20 text-red-700"
      case "high":
        return "bg-orange-500/10 border-orange-500/20 text-orange-700"
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
      case "low":
        return "bg-blue-500/10 border-blue-500/20 text-blue-700"
      default:
        return "bg-gray-500/10 border-gray-500/20"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="w-5 h-5" />
      case "high":
        return <AlertCircle className="w-5 h-5" />
      case "medium":
        return <Info className="w-5 h-5" />
      case "low":
        return <Lightbulb className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Energy Recommendations</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
          <p className="text-muted">
            AI-powered energy optimization strategies based on RCC (Responsible Computingr) best practices
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Analyzing telemetry data...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert className="mb-6 border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && recommendations.length === 0 && !error && (
          <Alert className="mb-6 border-blue-500/20 bg-blue-500/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No telemetry data available yet. Upload telemetry data from your workstations to receive recommendations.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recommendations.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {recommendations.filter((r) => r.priority === "critical").length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Potential Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0).toFixed(0)} kWh/yr
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Devices Affected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Set(recommendations.flatMap((r) => r.affectedDevices)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations List */}
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className={`border-2 transition-all ${getPriorityColor(rec.priority)}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getPriorityIcon(rec.priority)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {rec.priority}
                        </Badge>
                        <Badge variant="secondary">{rec.category}</Badge>
                      </div>
                      <CardDescription className="text-base">{rec.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Estimated Savings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded p-4 border border-border/50">
                    <p className="text-sm text-muted mb-1">Estimated Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {rec.estimatedSavings.toFixed(0)}
                      <span className="text-sm ml-2">kWh</span>
                    </p>
                    <p className="text-xs text-muted mt-2">
                      ~${(rec.estimatedSavings * 0.12).toFixed(0)}/year at $0.12/kWh
                    </p>
                  </div>

                  <div className="bg-background/50 rounded p-4 border border-border/50">
                    <p className="text-sm text-muted mb-1">Affected Workstations</p>
                    <p className="text-2xl font-bold">{rec.affectedDevices.length}</p>
                    <div className="text-xs text-muted mt-2 space-y-1">
                      {rec.affectedDevices.slice(0, 3).map((device) => (
                        <div key={device} className="truncate">
                          • {device}
                        </div>
                      ))}
                      {rec.affectedDevices.length > 3 && <div>• +{rec.affectedDevices.length - 3} more</div>}
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div className="bg-background/50 rounded p-4 border border-border/50">
                  <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                  <p className="text-sm leading-relaxed">{rec.action}</p>
                </div>

                {/* RCC Context */}
                <div className="bg-blue-500/5 rounded p-4 border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 mb-2">RCC BEST PRACTICE</p>
                  <p className="text-sm text-blue-600">{getRCCContext(rec.category)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* General RCC Guidelines */}
        {recommendations.length > 0 && (
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                RCC Energy Audit Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">Phase 1: Monitor & Measure</p>
                <p className="text-muted">
                  Collect detailed telemetry from all workstations to establish baseline energy consumption patterns.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Phase 2: Analyze & Identify</p>
                <p className="text-muted">
                  Use this dashboard to identify high-consumption zones and anomalies that deviate from best practices.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Phase 3: Optimize & Implement</p>
                <p className="text-muted">
                  Deploy the recommended changes, starting with high-impact, low-effort interventions like idle
                  management.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Phase 4: Verify & Report</p>
                <p className="text-muted">
                  Track metrics post-implementation and generate monthly sustainability reports for stakeholder
                  communication.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function getRCCContext(category: string): string {
  const contexts: { [key: string]: string } = {
    "Idle Management":
      "Reduce energy waste by 30-40% through aggressive idle policies and automated sleep schedules. This is the highest ROI optimization.",
    "Load Balancing":
      "Distributed task scheduling during off-peak hours reduces infrastructure strain and utility demand charges, typically saving 15-20% during peak periods.",
    "Hardware Efficiency":
      "Modern energy-efficient workstations consume 30-50% less power than older models. Strategic replacement programs prioritize equipment over 5 years old.",
    "Best Practices":
      "Staff engagement and visibility into energy metrics can reduce consumption by 5-15% through behavioral changes and awareness.",
  }
  return contexts[category] || "Implementing this recommendation aligns with RCC sustainability standards."
}
