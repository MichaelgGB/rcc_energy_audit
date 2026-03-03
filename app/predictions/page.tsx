"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  Leaf,
  Activity,
  AlertCircle,
  Info,
  ChevronRight,
  Calendar,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface IdleDevice {
  name: string
  currentIdleWatts: number
  hoursIdlePerDay: number
  dailyWasteKwh: number
  monthlyWasteCost: number
  yearlyWasteKwh: number
  yearlyWasteCost: number
  co2KgPerYear: number
}

interface Anomaly {
  device: string
  type: "high_power" | "unusual_pattern" | "idle_waste" | "spike"
  severity: "critical" | "warning" | "info"
  description: string
  currentValue: number
  expectedValue: number
  deviation: number
  timestamp: string
}

interface PredictionData {
  currentState: {
    totalDevices: number
    avgPowerDraw: number
    totalDailyKwh: number
    totalMonthlyCost: number
  }
  idleImpactPrediction: {
    devicesAnalyzed: number
    idleDevices: IdleDevice[]
    totalYearlyWaste: {
      kWh: number
      cost: number
      co2Kg: number
    }
  }
  noActionPrediction: {
    nextMonth: {
      estimatedKwh: number
      estimatedCost: number
      co2Kg: number
    }
    nextYear: {
      estimatedKwh: number
      estimatedCost: number
      co2Kg: number
    }
    withRecommendations: {
      yearlyKwh: number
      yearlyCost: number
      yearlySavingsKwh: number
      yearlySavingsCost: number
      co2Reduction: number
    }
  }
  anomalies: Anomaly[]
}

import { PageHelp } from "@/components/page-help"

export default function PredictionsDashboard() {
  const router = useRouter()
  const [predictions, setPredictions] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch("/api/predictions/analyze")
        if (!response.ok) throw new Error("Failed to fetch predictions")
        const data = await response.json()

        if (data.predictions) {
          setPredictions(data.predictions)
        } else {
          setError(data.error || "No data available")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 border-red-500/50 text-red-700"
      case "warning":
        return "bg-orange-500/10 border-orange-500/50 text-orange-700"
      default:
        return "bg-blue-500/10 border-blue-500/50 text-blue-700"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const HeaderBlock = () => (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Power Predictions & Anomaly Detection</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Predictive analytics and real-time anomaly detection for energy consumption
          </p>
        </div>
        <PageHelp title="Predictions Guide" description="Understanding forecasts and anomaly detection.">
          <h3 className="font-semibold text-foreground">What are Predictions?</h3>
          <p>
            The Predictions page applies machine learning and statistical analysis to your historical telemetry data to forecast future energy consumption, identify waste patterns, and detect operational anomalies. It answers the question: "What will happen if we continue current practices?"
          </p>

          <h3 className="font-semibold text-foreground mt-4">Data Requirements</h3>
          <p>
            Predictions require sufficient telemetry data to establish baseline patterns. Upload at least:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>7 days of continuous data</strong> for initial trend analysis</li>
            <li><strong>30+ days of data</strong> for accurate monthly forecasts and weekly pattern detection</li>
            <li><strong>Multiple machines</strong> from the same lab/location for comparative analysis</li>
          </ul>
          <p className="mt-2">
            The system automatically analyzes uploaded telemetry to generate predictions without requiring manual configuration.
          </p>

          <h3 className="font-semibold text-foreground mt-4">Key Sections Explained</h3>

          <h4 className="font-semibold text-foreground mt-3">1. Current State Overview</h4>
          <p>
            Provides a real-time snapshot based on the most recent telemetry data points:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Total Active Devices:</strong> Number of unique machines with recent telemetry</li>
            <li><strong>Average Power Draw:</strong> Mean instantaneous power consumption across the fleet</li>
            <li><strong>Total Daily kWh:</strong> Aggregate energy consumption extrapolated from recent patterns</li>
            <li><strong>Monthly Cost Estimate:</strong> Current spending rate based on configured tariff (default: 16.3 KSh/kWh)</li>
          </ul>

          <h4 className="font-semibold text-foreground mt-3">2. Idle Impact Prediction</h4>
          <p>
            Identifies machines exhibiting significant idle power consumption (CPU utilization consistently below 5%) and calculates the financial and environmental cost of this waste:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Idle Device List:</strong> Specific machines wasting energy, ranked by severity</li>
            <li><strong>Daily Waste per Device:</strong> kWh consumed during idle periods each day</li>
            <li><strong>Annual Waste Projection:</strong> Extrapolated yearly cost (KSh) and carbon emissions (kg CO₂) if idle behavior continues</li>
            <li><strong>Total Fleet Idle Waste:</strong> Aggregate waste across all identified devices</li>
          </ul>
          <p className="mt-2">
            <strong>Common causes of idle waste:</strong> Machines left on overnight, disabled sleep/hibernation settings, screen savers preventing power management, users forgetting to log out.
          </p>

          <h4 className="font-semibold text-foreground mt-3">3. No Action Forecasts</h4>
          <p>
            Projects future costs and consumption if current trends continue unchanged:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Next Month Forecast:</strong> Estimated kWh, cost (KSh), and CO₂ emissions for the upcoming 30 days</li>
            <li><strong>Next Year Forecast:</strong> Annual projections accounting for seasonal variations and growth trends</li>
            <li><strong>With Recommendations Scenario:</strong> Potential outcomes if you implement the system's automated recommendations (from the Recommendations page), showing estimated savings in kWh, costs, and carbon reductions</li>
          </ul>
          <p className="mt-2">
            Use these forecasts to budget for energy expenses, set sustainability goals, and justify intervention investments to stakeholders.
          </p>

          <h4 className="font-semibold text-foreground mt-3">4. Detected Anomalies</h4>
          <p>
            The anomaly detection engine continuously monitors telemetry streams for unusual behavior:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>High Power Events:</strong> Machines suddenly drawing significantly more watts than their historical baseline (could indicate hardware failure, malware, or unauthorized workloads like cryptocurrency mining)</li>
            <li><strong>Unusual Patterns:</strong> Devices active during unexpected hours (e.g., lab machines running at 3 AM when the building should be empty)</li>
            <li><strong>Idle Waste Alerts:</strong> Machines consistently idle but never entering sleep mode despite policy enforcement</li>
            <li><strong>Power Spikes:</strong> Brief but extreme power consumption events that might indicate electrical issues</li>
          </ul>
          <p className="mt-2">
            Each anomaly includes:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Severity:</strong> Critical (immediate action required), Warning (investigate soon), or Info (monitor for trends)</li>
            <li><strong>Device Name:</strong> Specific machine exhibiting the anomaly</li>
            <li><strong>Deviation Percentage:</strong> How far the behavior deviates from expected norms</li>
            <li><strong>Timestamp:</strong> When the anomaly was first detected</li>
            <li><strong>Expected vs Actual Values:</strong> Comparison showing the magnitude of abnormality</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-4">How Predictions Work</h3>
          <p>
            The prediction engine uses statistical modeling techniques:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Time-Series Analysis:</strong> Identifies daily, weekly, and seasonal patterns in consumption</li>
            <li><strong>Linear Regression:</strong> Projects trends forward based on historical growth rates</li>
            <li><strong>Idle Detection Algorithm:</strong> Classifies machines as idle when CPU usage remains below 5% for &gt;85% of measured time</li>
            <li><strong>Anomaly Scoring:</strong> Uses standard deviation thresholds (typically 2-3 sigma) to flag outliers</li>
            <li><strong>Confidence Intervals:</strong> Predictions include uncertainty ranges based on data quality and variability</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-4">Actionable Insights</h3>
          <p>
            Use predictions to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Budget Planning:</strong> Accurate monthly and annual cost forecasts for financial planning</li>
            <li><strong>Policy Enforcement:</strong> Identify labs/departments not following power management policies</li>
            <li><strong>Capacity Planning:</strong> Detect growing power demands before they strain electrical infrastructure</li>
            <li><strong>Behavior Change:</strong> Share idle waste reports with users to encourage responsible computing practices</li>
            <li><strong>Security Monitoring:</strong> Investigate anomalies that might indicate unauthorized access or compromised systems</li>
            <li><strong>ROI Tracking:</strong> Compare "with recommendations" forecasts to actual consumption after implementing changes</li>
          </ul>

          <h3 className="font-semibold text-foreground mt-4">Best Practices</h3>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Review predictions weekly to identify new idle devices or emerging anomalies</li>
            <li>Investigate critical anomalies within 24 hours to prevent damage or excessive waste</li>
            <li>Compare monthly forecasts with actual bills to validate prediction accuracy</li>
            <li>Export idle device lists to share with lab managers for corrective action</li>
            <li>Track forecast improvements after implementing recommendations to measure initiative success</li>
          </ul>
        </PageHelp>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderBlock />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Analyzing power consumption patterns...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !predictions) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderBlock />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Alert className="border-destructive bg-destructive/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "No prediction data available. Upload telemetry first."}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { currentState, idleImpactPrediction, noActionPrediction, anomalies } = predictions

  return (
    <div className="min-h-screen bg-background">
      <HeaderBlock />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Critical Anomalies Alert */}
        {anomalies.filter(a => a.severity === "critical").length > 0 && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-700 font-bold">
              {anomalies.filter(a => a.severity === "critical").length} Critical Anomalies Detected!
            </AlertTitle>
            <AlertDescription className="text-red-600">
              Immediate attention required. Unusual power consumption patterns detected that could indicate waste or hardware issues.
            </AlertDescription>
          </Alert>
        )}

        {/* Current State Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Current Power Consumption
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentState.totalDevices}</div>
                <p className="text-xs text-muted-foreground mt-1">Active workstations</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Power Draw</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{currentState.avgPowerDraw}W</div>
                <p className="text-xs text-muted-foreground mt-1">Per device</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{currentState.totalDailyKwh} kWh</div>
                <p className="text-xs text-muted-foreground mt-1">All devices combined</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">Ksh {currentState.totalMonthlyCost.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">At current rate</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Idle Impact Prediction */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            Impact of Idle Devices
          </h2>

          {idleImpactPrediction.idleDevices.length > 0 ? (
            <>
              <Card className="mb-4 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">
                    {idleImpactPrediction.idleDevices.length} Devices Running Idle
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    These devices spend significant time idle but consuming high power
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Yearly Energy Waste</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {idleImpactPrediction.totalYearlyWaste.kWh.toFixed(0)} kWh
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">Yearly Cost Waste</p>
                      <p className="text-2xl font-bold text-purple-900">
                        Ksh {idleImpactPrediction.totalYearlyWaste.cost.toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-1">CO₂ Emissions</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {idleImpactPrediction.totalYearlyWaste.co2Kg.toFixed(0)} kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {idleImpactPrediction.idleDevices.map((device, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-purple-900">{device.name}</h3>
                            <p className="text-sm text-purple-600">
                              Idle {device.hoursIdlePerDay}h/day at {device.currentIdleWatts}W
                            </p>
                          </div>
                          <Badge variant="destructive">High Waste</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-purple-600">Daily Waste</p>
                            <p className="font-semibold text-purple-900">{device.dailyWasteKwh} kWh</p>
                          </div>
                          <div>
                            <p className="text-purple-600">Monthly Cost</p>
                            <p className="font-semibold text-purple-900">Ksh {device.monthlyWasteCost.toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-purple-600">Yearly Waste</p>
                            <p className="font-semibold text-purple-900">{device.yearlyWasteKwh} kWh</p>
                          </div>
                          <div>
                            <p className="text-purple-600">CO₂/year</p>
                            <p className="font-semibold text-purple-900">{device.co2KgPerYear} kg</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">No Excessive Idle Detected</AlertTitle>
              <AlertDescription className="text-green-600">
                Your devices are being used efficiently with minimal idle time waste.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* No-Action Prediction */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            If No Action Is Taken
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Calendar className="w-5 h-5" />
                  Next Month Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Energy Consumption</span>
                  <span className="text-xl font-bold text-orange-900">
                    {noActionPrediction.nextMonth.estimatedKwh} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Estimated Cost</span>
                  <span className="text-xl font-bold text-orange-900">
                    Ksh {noActionPrediction.nextMonth.estimatedCost.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">CO₂ Emissions</span>
                  <span className="text-xl font-bold text-orange-900">
                    {noActionPrediction.nextMonth.co2Kg.toFixed(0)} kg
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Calendar className="w-5 h-5" />
                  Next Year Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-red-700">Energy Consumption</span>
                  <span className="text-xl font-bold text-red-900">
                    {noActionPrediction.nextYear.estimatedKwh.toFixed(0)} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-700">Estimated Cost</span>
                  <span className="text-xl font-bold text-red-900">
                    Ksh {noActionPrediction.nextYear.estimatedCost.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-700">CO₂ Emissions</span>
                  <span className="text-xl font-bold text-red-900">
                    {noActionPrediction.nextYear.co2Kg.toFixed(0)} kg
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* With Recommendations */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Leaf className="w-5 h-5" />
                With Recommendations Applied
              </CardTitle>
              <CardDescription className="text-green-700">
                Projected savings if you implement all recommended optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Yearly Savings</p>
                  <p className="text-2xl font-bold text-green-900">
                    {noActionPrediction.withRecommendations.yearlySavingsKwh.toFixed(0)} kWh
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Ksh {noActionPrediction.withRecommendations.yearlySavingsCost.toFixed(0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 mb-1">New Yearly Cost</p>
                  <p className="text-2xl font-bold text-green-900">
                    Ksh {noActionPrediction.withRecommendations.yearlyCost.toFixed(0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {((noActionPrediction.withRecommendations.yearlySavingsCost / noActionPrediction.nextYear.estimatedCost) * 100).toFixed(1)}% reduction
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 mb-1">CO₂ Reduction</p>
                  <p className="text-2xl font-bold text-green-900">
                    {noActionPrediction.withRecommendations.co2Reduction.toFixed(0)} kg
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Environmental impact avoided
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anomaly Detection */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Detected Anomalies ({anomalies.length})
          </h2>

          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <Alert key={idx} className={`${getSeverityColor(anomaly.severity)} border-2`}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(anomaly.severity)}
                    <div className="flex-1">
                      <AlertTitle className="font-bold mb-2">
                        {anomaly.device} - {anomaly.type.replace('_', ' ').toUpperCase()}
                      </AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>{anomaly.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
                          <div>
                            <span className="font-semibold">Current:</span> {anomaly.currentValue.toFixed(1)}W
                          </div>
                          <div>
                            <span className="font-semibold">Expected:</span> {anomaly.expectedValue.toFixed(1)}W
                          </div>
                          <div>
                            <span className="font-semibold">Deviation:</span> +{anomaly.deviation.toFixed(1)}W
                          </div>
                          <div>
                            <span className="font-semibold">Time:</span> {new Date(anomaly.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">All Systems Normal</AlertTitle>
              <AlertDescription className="text-green-600">
                No anomalies detected. All devices are operating within expected parameters.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Items */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {idleImpactPrediction.idleDevices.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900">
                  <strong>Enable sleep mode</strong> on {idleImpactPrediction.idleDevices.length} idle devices to save Ksh {idleImpactPrediction.totalYearlyWaste.cost.toFixed(0)}/year
                </p>
              </div>
            )}
            {anomalies.filter(a => a.severity === "critical").length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900">
                  <strong>Investigate</strong> {anomalies.filter(a => a.severity === "critical").length} critical anomalies immediately
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-900">
                <strong>Review recommendations</strong> to potentially save Ksh {noActionPrediction.withRecommendations.yearlySavingsCost.toFixed(0)}/year
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}