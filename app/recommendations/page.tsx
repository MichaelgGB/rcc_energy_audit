"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, Lightbulb, CheckCircle, AlertCircle, Info } from "lucide-react"
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

import { PageHelp } from "@/components/page-help"

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [totalConsumption, setTotalConsumption] = useState<number>(0)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations/compute")
        if (!response.ok) throw new Error("Failed to fetch recommendations")
        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setTotalConsumption(data.totalConsumption || 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const getTotalSavings = () => {
    const totalKwh = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0)
    const totalCost = totalKwh * 16.3 // KSh per kWh
    const reductionPercent = totalConsumption > 0 ? (totalKwh / totalConsumption) * 100 : 0
    return { totalKwh, totalCost, reductionPercent }
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

  const totalSavings = getTotalSavings()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold">Energy Optimization Recommendations</h1>
            </div>
            <p className="text-muted mt-2">
              Data-driven strategies to reduce energy consumption and operational costs
            </p>
          </div>
          <PageHelp title="Recommendations Guide" description="Actionable interventions to optimize energy consumption and reduce costs.">
            <h3 className="font-semibold text-foreground">What are Recommendations?</h3>
            <p>
              The Recommendations Engine automatically analyzes your audit data and telemetry streams to generate prioritized, actionable suggestions for reducing energy consumption and operational costs. Unlike predictions (which forecast future states), recommendations tell you exactly what to do and estimate the savings from each action in both kWh and KSh.
            </p>

            <h3 className="font-semibold text-foreground mt-4">How Recommendations are Computed</h3>
            <p>
              The system employs multiple heuristic algorithms and rule-based logic to identify optimization opportunities:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Idle Device Detection:</strong> Machines with &gt;85% of time below 5% CPU utilization are flagged for automatic sleep/shutdown policies</li>
              <li><strong>Power State Analysis:</strong> Devices that never enter low-power states despite idle periods suggest misconfigured power management</li>
              <li><strong>Inefficiency Scoring:</strong> Compares device power consumption against modern efficiency standards (e.g., 80 Plus certification for power supplies)</li>
              <li><strong>Usage Pattern Matching:</strong> Identifies lighting or HVAC running during unoccupied hours based on schedule data</li>
              <li><strong>Hardware Age Analysis:</strong> Flags devices older than 7 years for replacement consideration, especially if combined with high power consumption</li>
              <li><strong>Comparative Benchmarking:</strong> Ranks similar devices (same class/model) to identify outliers consuming abnormally high power</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Understanding Priority Levels</h3>
            <p>
              Each recommendation is assigned a priority level that determines urgency and expected impact:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Critical (Red):</strong> Immediate action required. Often indicates severe waste costing thousands of KSh monthly, such as:
                <ul className="list-disc ml-6 mt-1">
                  <li>Servers or HVAC running 24/7 in unused spaces</li>
                  <li>Dozens of workstations left powered on overnight across multiple labs</li>
                  <li>Grossly inefficient equipment consuming 3-5x typical power for their category</li>
                </ul>
              </li>
              <li><strong>High (Orange):</strong> Important optimizations with significant savings potential, such as:
                <ul className="list-disc ml-6 mt-1">
                  <li>Enforcing automatic sleep mode on lab computers after 30 minutes idle</li>
                  <li>Replacing aging devices that have surpassed 10 years of service</li>
                  <li>Upgrading to LED lighting in high-usage areas</li>
                </ul>
              </li>
              <li><strong>Medium (Yellow):</strong> Worthwhile improvements with moderate impact:
                <ul className="list-disc ml-6 mt-1">
                  <li>Optimizing HVAC setpoints (raising cooling temp by 1-2°C)</li>
                  <li>Consolidating servers to improve utilization rates</li>
                  <li>Scheduling backups and maintenance during off-peak hours</li>
                </ul>
              </li>
              <li><strong>Low (Blue):</strong> Incremental optimizations and best practice adoptions:
                <ul className="list-disc ml-6 mt-1">
                  <li>Employee behavior changes (monitor brightness reduction, closing unused applications)</li>
                  <li>Seasonal adjustments to heating/cooling schedules</li>
                  <li>Preventive maintenance to maintain efficiency over time</li>
                </ul>
              </li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Recommendation Card Details</h3>
            <p>
              Each recommendation card displays comprehensive information:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Title:</strong> Concise description of the recommended action</li>
              <li><strong>Category:</strong> Classification like "Power Management", "Hardware Replacement", "Policy Change", "Behavioral", "Infrastructure"</li>
              <li><strong>Description:</strong> Detailed explanation of the problem, its causes, and why this recommendation matters</li>
              <li><strong>Energy Savings:</strong> Annual energy reduction in kWh from implementing this recommendation</li>
              <li><strong>Cost Savings:</strong> Annual cost reduction in KSh based on current electricity rates (KSh 16.30/kWh)</li>
              <li><strong>Reduction Percentage:</strong> Percentage of total fleet energy consumption this recommendation addresses</li>
              <li><strong>Affected Devices:</strong> Specific machines, locations, or device classes impacted by this action</li>
              <li><strong>Action Steps:</strong> Concrete implementation guidance (e.g., "Configure Group Policy: Set sleep timer to 30 minutes")</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Understanding the Metrics</h3>
            <p>
              The three key metrics help you prioritize and justify implementations:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>kWh Saved:</strong> Direct energy reduction - the primary technical metric for measuring efficiency improvements</li>
              <li><strong>Cost Savings (KSh):</strong> Financial impact using Kenya Power's commercial rate of KSh 16.30/kWh - crucial for ROI calculations and budget justification</li>
              <li><strong>% Reduction:</strong> Relative impact on your total energy consumption - helps identify which recommendations have the biggest impact on your overall footprint</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Implementing Recommendations</h3>
            <p>
              <strong>Recommended workflow:</strong>
            </p>
            <ol className="list-decimal ml-6 mt-2 space-y-1">
              <li><strong>Triage:</strong> Address all Critical recommendations within 1-2 weeks to stop severe waste immediately</li>
              <li><strong>Quick Wins:</strong> Implement High/Medium software-based recommendations (power management policies, schedules) that require minimal cost</li>
              <li><strong>Budget Planning:</strong> Use estimated savings to justify capital expenses for hardware replacements</li>
              <li><strong>Phased Rollout:</strong> Implement changes in one pilot lab, measure actual savings over 2-4 weeks, then expand</li>
              <li><strong>Monitor Impact:</strong> Return to Dashboard and Predictions pages after implementation to verify savings match estimates</li>
              <li><strong>Iterate:</strong> Re-run recommendations monthly as new telemetry data reveals additional opportunities</li>
            </ol>

            <h3 className="font-semibold text-foreground mt-4">Common Recommendation Types</h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Enforce Sleep Policies:</strong> Most impactful low-cost intervention. Configure OS-level power management via Group Policy (Windows) or cron jobs (Linux)</li>
              <li><strong>Schedule-Based Shutdowns:</strong> Automatically power off lab computers at closing time, wake on LAN for morning classes</li>
              <li><strong>Replace Inefficient Devices:</strong> Target devices &gt;7 years old with high power consumption. Use Simulations page to compare specific models</li>
              <li><strong>Right-Size Infrastructure:</strong> Consolidate underutilized servers, scale down oversized cooling systems</li>
              <li><strong>Lighting Upgrades:</strong> Replace fluorescent tubes with LED panels (70-80% energy reduction with 2-3 year payback)</li>
              <li><strong>Behavioral Campaigns:</strong> Share idle waste reports with users, display real-time consumption dashboards in labs</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Integration with Other Pages</h3>
            <p>
              Recommendations integrate seamlessly with the platform's other tools:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Dashboard:</strong> Verify which device classes consume most energy to prioritize recommendations</li>
              <li><strong>Predictions:</strong> See "With Recommendations" forecast showing projected savings</li>
              <li><strong>Simulations:</strong> Model specific hardware replacements suggested by recommendations with detailed TCO analysis</li>
              <li><strong>Reports:</strong> Track actual cost reductions and consumption trends after implementations</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">Best Practices</h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Review recommendations weekly as new telemetry data arrives</li>
              <li>Document implementation status and actual savings achieved for ROI tracking</li>
              <li>Share recommendations with facilities management and IT teams for collaborative implementation</li>
              <li>Use cost savings data to justify capital expenditures and demonstrate operational efficiency improvements</li>
              <li>Celebrate and communicate wins (e.g., "Undergraduate Lab reduced energy costs by 35% this semester") to encourage continued participation</li>
            </ul>
          </PageHelp>
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

        {/* Total Savings Summary */}
        {recommendations.length > 0 && (
          <>
            <Card className="mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                  Total Potential Savings - If All Recommendations Implemented
                </CardTitle>
                <CardDescription>Annual energy and cost reduction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/50 rounded-lg p-6 border border-green-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Energy Savings</p>
                    <p className="text-4xl font-bold text-green-700">
                      {totalSavings.totalKwh.toFixed(0)}
                      <span className="text-xl ml-2">kWh</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Annual reduction
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-6 border border-green-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Cost Savings</p>
                    <p className="text-4xl font-bold text-green-700">
                      KSh {totalSavings.totalCost.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Per year at KSh 16.30/kWh
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-6 border border-green-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Energy Reduction</p>
                    <p className="text-4xl font-bold text-green-700">
                      {totalSavings.reductionPercent.toFixed(1)}
                      <span className="text-xl ml-1">%</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Of current consumption
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
            const costSavings = rec.estimatedSavings * 16.3
            const reductionPercent = totalConsumption > 0 ? (rec.estimatedSavings / totalConsumption) * 100 : 0
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
                  {/* Savings Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background/50 rounded p-4 border border-border/50">
                      <p className="text-sm text-muted mb-1">Energy Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {rec.estimatedSavings.toFixed(0)}
                        <span className="text-sm ml-2">kWh/yr</span>
                      </p>
                      <p className="text-xs text-muted mt-2">
                        Annual reduction
                      </p>
                    </div>

                    <div className="bg-background/50 rounded p-4 border border-border/50">
                      <p className="text-sm text-muted mb-1">Cost Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        KSh {costSavings.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        Per year at KSh 16.30/kWh
                      </p>
                    </div>

                    <div className="bg-background/50 rounded p-4 border border-border/50">
                      <p className="text-sm text-muted mb-1">Reduction</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reductionPercent.toFixed(1)}
                        <span className="text-sm ml-1">%</span>
                      </p>
                      <p className="text-xs text-muted mt-2">
                        Of total consumption
                      </p>
                    </div>
                  </div>

                  {/* Affected Devices */}
                  <div className="bg-background/50 rounded p-4 border border-border/50">
                    <p className="text-sm font-semibold mb-2">Affected Devices ({rec.affectedDevices.length}):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted">
                      {rec.affectedDevices.slice(0, 6).map((device) => (
                        <div key={device} className="truncate">
                          • {device}
                        </div>
                      ))}
                      {rec.affectedDevices.length > 6 && (
                        <div className="text-primary">• +{rec.affectedDevices.length - 6} more devices</div>
                      )}
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="bg-background/50 rounded p-4 border border-border/50">
                    <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                    <p className="text-sm leading-relaxed">{rec.action}</p>
                  </div>

                  {/* Business Context */}
                  <div className="bg-blue-500/5 rounded p-4 border border-blue-500/20">
                    <p className="text-xs font-semibold text-blue-700 mb-2">IMPLEMENTATION IMPACT</p>
                    <p className="text-sm text-blue-600">{getRCCContext(rec.category)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Implementation Framework */}
        {recommendations.length > 0 && (
          <>
            <Card className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Energy Optimization Implementation Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">Phase 1: Monitor & Measure</p>
                  <p className="text-muted">
                    Collect detailed telemetry from all workstations to establish baseline energy consumption patterns and identify optimization opportunities.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Phase 2: Analyze & Prioritize</p>
                  <p className="text-muted">
                    Use this dashboard to identify high-consumption zones and prioritize interventions by cost savings potential and implementation effort.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Phase 3: Implement & Deploy</p>
                  <p className="text-muted">
                    Deploy the recommended changes, starting with high-ROI, low-effort interventions like automated power management policies.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Phase 4: Verify & Iterate</p>
                  <p className="text-muted">
                    Track metrics post-implementation to verify actual savings match estimates. Re-run analysis monthly to identify new optimization opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Responsible Computing Principles */}
            <Card className="mt-8 bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                  Why Energy Optimization Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-700">💰 Direct Cost Savings</p>
                    <p className="text-muted">
                      Energy costs are a significant operational expense. Implementing these recommendations directly reduces your monthly electricity bills, freeing up budget for core educational and research activities.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-700">📊 Operational Efficiency</p>
                    <p className="text-muted">
                      Optimizing energy usage often improves overall system performance. Proper power management reduces hardware wear, extends equipment lifespan, and decreases maintenance costs.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-orange-700">⚡ Infrastructure Capacity</p>
                    <p className="text-muted">
                      Reducing peak demand means existing infrastructure can support more devices without upgrades. This defers costly electrical system expansions and reduces transformer/circuit load.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-700">📈 Scalability & Planning</p>
                    <p className="text-muted">
                      Understanding consumption patterns enables better capacity planning. Data-driven decisions help allocate resources efficiently and predict future infrastructure needs accurately.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">Business Impact:</p>
                  <p className="text-sm text-green-700">
                    Implementing these recommendations typically delivers 15-40% reduction in energy costs with minimal capital investment. The data-driven approach ensures interventions target the highest-impact opportunities first, maximizing ROI.
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
      "Reducing idle power consumption is the most cost-effective energy optimization strategy. Devices left running unnecessarily waste significant energy. Automated sleep policies can reduce energy costs by 30-40% with zero impact on productivity or user experience.",
    "Load Balancing":
      "Shifting computational workloads to off-peak hours reduces demand charges and takes advantage of lower electricity rates. Temporal load balancing optimizes infrastructure capacity and can reduce peak demand costs by 15-25%.",
    "Hardware Efficiency":
      "Modern energy-efficient hardware not only consumes less power but also reduces cooling requirements and maintenance costs. Strategic hardware upgrades typically pay for themselves within 2-4 years through reduced operational expenses.",
    "Best Practices":
      "Energy optimization is not just about technology—it's about operational culture. Staff awareness of consumption patterns and providing visibility into metrics creates lasting behavioral changes that compound cost savings over time.",
  }
  return contexts[category] || "Implementing this recommendation reduces operational costs and improves infrastructure efficiency."
}