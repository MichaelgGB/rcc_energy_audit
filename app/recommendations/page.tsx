"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, Lightbulb, CheckCircle, AlertCircle, Info, Leaf, Cloud, Droplet, TreePine } from "lucide-react"
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

interface EnvironmentalImpact {
  co2Kg: number
  treesEquivalent: number
  waterLiters: number
  coalKg: number
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

  const calculateEnvironmentalImpact = (kwhSaved: number): EnvironmentalImpact => {
    // Kenya's grid carbon intensity: ~0.4 kg CO2/kWh (cleaner due to geothermal/hydro)
    const co2Kg = kwhSaved * 0.4
    
    // 1 tree absorbs ~21 kg CO2/year
    const treesEquivalent = co2Kg / 21
    
    // Water used in energy production: ~3 liters per kWh
    const waterLiters = kwhSaved * 3
    
    // Coal equivalent: 1 kWh ≈ 0.4 kg of coal
    const coalKg = kwhSaved * 0.4
    
    return { co2Kg, treesEquivalent, waterLiters, coalKg }
  }

  const getTotalEnvironmentalImpact = (): EnvironmentalImpact => {
    const totalKwh = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0)
    return calculateEnvironmentalImpact(totalKwh)
  }

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

  const totalImpact = getTotalEnvironmentalImpact()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold">Energy & Environmental Impact</h1>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-muted">
            Energy optimization strategies based on Responsible Computing (RC) principles
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

        {/* Environmental Impact Summary */}
        {recommendations.length > 0 && (
          <>
            <Card className="mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Leaf className="w-6 h-6" />
                  Total Environmental Impact - If All Recommendations Implemented
                </CardTitle>
                <CardDescription>Annual reduction in environmental footprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">CO₂ Emissions Avoided</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {totalImpact.co2Kg.toFixed(0)}
                      <span className="text-lg ml-1">kg</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(totalImpact.co2Kg / 1000).toFixed(2)} metric tons CO₂
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-600">Trees Planted Equivalent</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {totalImpact.treesEquivalent.toFixed(1)}
                      <span className="text-lg ml-1">trees</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual carbon absorption
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">Water Saved</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {(totalImpact.waterLiters / 1000).toFixed(1)}
                      <span className="text-lg ml-1">m³</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalImpact.waterLiters.toFixed(0)} liters
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium text-gray-600">Coal Not Burned</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">
                      {totalImpact.coalKg.toFixed(0)}
                      <span className="text-lg ml-1">kg</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fossil fuel equivalent
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
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
                  <CardTitle className="text-sm font-medium">Energy Savings</CardTitle>
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
          </>
        )}

        {/* Recommendations List */}
        <div className="space-y-6">
          {recommendations.map((rec, idx) => {
            const impact = calculateEnvironmentalImpact(rec.estimatedSavings)
            return (
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
                  {/* Energy & Financial Savings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded p-4 border border-border/50">
                      <p className="text-sm text-muted mb-1">Estimated Annual Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {rec.estimatedSavings.toFixed(0)}
                        <span className="text-sm ml-2">kWh</span>
                      </p>
                      <p className="text-xs text-muted mt-2">
                        ~Ksh {(rec.estimatedSavings * 16.3).toFixed(0)}/year at Ksh 16.30/kWh
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

                  {/* Environmental Impact */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="w-5 h-5 text-green-700" />
                      <p className="text-sm font-semibold text-green-800">Environmental Impact</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-green-600 mb-1">CO₂ Avoided</p>
                        <p className="text-lg font-bold text-green-700">{impact.co2Kg.toFixed(1)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 mb-1">Trees Equivalent</p>
                        <p className="text-lg font-bold text-green-700">{impact.treesEquivalent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Water Saved</p>
                        <p className="text-lg font-bold text-blue-700">{(impact.waterLiters / 1000).toFixed(2)} m³</p>
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 mb-1">Coal Not Burned</p>
                        <p className="text-lg font-bold text-orange-700">{impact.coalKg.toFixed(1)} kg</p>
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
                    <p className="text-xs font-semibold text-blue-700 mb-2">RESPONSIBLE COMPUTING PRINCIPLE</p>
                    <p className="text-sm text-blue-600">{getRCCContext(rec.category)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Responsible Computing Framework */}
        {recommendations.length > 0 && (
          <>
            <Card className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Responsible Computing Energy Audit Framework
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

            {/* Responsible Computing Principles */}
            <Card className="mt-8 bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Why Responsible Computing Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-700">🌍 Climate Impact</p>
                    <p className="text-muted">
                      ICT sector accounts for 2-4% of global carbon emissions. Data centers and end-user devices consume massive amounts of energy, contributing to climate change. Responsible computing reduces this footprint.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-700">💧 Water Conservation</p>
                    <p className="text-muted">
                      Power plants use significant water for cooling. In Kenya, where water scarcity is an issue, reducing energy consumption directly saves water resources for communities and agriculture.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-orange-700">⚡ Energy Independence</p>
                    <p className="text-muted">
                      Reducing energy demand decreases reliance on fossil fuels and supports Kenya's renewable energy goals. Every kWh saved is one less to generate from coal or diesel.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-700">💰 Economic Benefits</p>
                    <p className="text-muted">
                      Lower energy costs mean more resources for core business operations. Organizations save money while contributing to environmental sustainability—a win-win scenario.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">Kenya's Context:</p>
                  <p className="text-sm text-green-700">
                    While Kenya has one of the cleanest electricity grids in Africa (80%+ renewable), reducing consumption still matters. Peak demand requires fossil fuel plants, and less consumption means less infrastructure strain, lower costs, and preserved natural resources for future generations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

function getRCCContext(category: string): string {
  const contexts: { [key: string]: string } = {
    "Idle Management":
      "Reducing idle power consumption is the foundation of responsible computing. Devices left running unnecessarily waste energy and increase carbon emissions. Automated sleep policies can reduce energy waste by 30-40% with zero impact on productivity.",
    "Load Balancing":
      "Shifting computational workloads to off-peak hours reduces strain on the power grid and takes advantage of times when renewable energy sources (like solar) are more abundant. This temporal load balancing is a key strategy in sustainable computing.",
    "Hardware Efficiency":
      "Modern energy-efficient hardware not only consumes less power but is also manufactured with better environmental standards. Responsible procurement considers the full lifecycle: production, use, and disposal. Strategic upgrades reduce both operational emissions and e-waste.",
    "Best Practices":
      "Responsible computing is not just about technology—it's about culture. Educating staff on energy impacts, providing visibility into consumption metrics, and fostering awareness creates lasting behavioral change that compounds environmental benefits.",
  }
  return contexts[category] || "Implementing this recommendation aligns with responsible computing principles and reduces environmental impact."
}