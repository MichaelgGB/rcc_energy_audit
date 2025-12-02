"use client"
import { useState } from "react"
import { AlertCircle, Leaf, TrendingDown, CheckCircle, Droplets, DollarSign, Activity, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SimulationState {
  isRunning: boolean
  results: any | null
  error: string | null
}

export default function SimulationsPage() {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    results: null,
    error: null,
  })

  // Global Settings
  const [tariff, setTariff] = useState<number>(16.3)
  const [carbonFactor, setCarbonFactor] = useState<number>(0.4)
  const [degradationRate, setDegradationRate] = useState<number>(2)
  const [includeUncertainty, setIncludeUncertainty] = useState<boolean>(true)

  // Device A (Existing - High Contrast: Red/Warm)
  const [deviceAName, setDeviceAName] = useState("Existing Device")
  const [deviceAAge, setDeviceAAge] = useState(3)
  const [deviceAIdleWatts, setDeviceAIdleWatts] = useState(50)
  const [deviceANormalWatts, setDeviceANormalWatts] = useState(120)
  const [deviceAPeakWatts, setDeviceAPeakWatts] = useState(200)
  const [deviceAIdleHours, setDeviceAIdleHours] = useState(2)
  const [deviceANormalHours, setDeviceANormalHours] = useState(6)
  const [deviceAPeakHours, setDeviceAPeakHours] = useState(0)
  const [deviceAMaintenanceCost, setDeviceAMaintenanceCost] = useState(5000)

  // Device B (Replacement - High Contrast: Green/Cool)
  const [deviceBName, setDeviceBName] = useState("Replacement Device")
  const [deviceBAge, setDeviceBAge] = useState(0)
  const [deviceBIdleWatts, setDeviceBIdleWatts] = useState(30)
  const [deviceBNormalWatts, setDeviceBNormalWatts] = useState(80)
  const [deviceBPeakWatts, setDeviceBPeakWatts] = useState(150)
  const [deviceBIdleHours, setDeviceBIdleHours] = useState(2)
  const [deviceBNormalHours, setDeviceBNormalHours] = useState(6)
  const [deviceBPeakHours, setDeviceBPeakHours] = useState(0)
  const [deviceBMaintenanceCost, setDeviceBMaintenanceCost] = useState(2000)
  const [deviceBPurchaseCost, setDeviceBPurchaseCost] = useState(80000)

  const handleSimulationRun = async () => {
    setSimulationState({ isRunning: true, results: null, error: null })

    const formData = {
      deviceA: {
        name: deviceAName,
        age: deviceAAge,
        idleWatts: deviceAIdleWatts,
        normalWatts: deviceANormalWatts,
        peakWatts: deviceAPeakWatts,
        idleHours: deviceAIdleHours,
        normalHours: deviceANormalHours,
        peakHours: deviceAPeakHours,
        maintenanceCost: deviceAMaintenanceCost,
      },
      deviceB: {
        name: deviceBName,
        age: deviceBAge,
        idleWatts: deviceBIdleWatts,
        normalWatts: deviceBNormalWatts,
        peakWatts: deviceBPeakWatts,
        idleHours: deviceBIdleHours,
        normalHours: deviceBNormalHours,
        peakHours: deviceBPeakHours,
        maintenanceCost: deviceBMaintenanceCost,
        purchaseCost: deviceBPurchaseCost,
      },
      tariff,
      carbonFactor,
      degradationRate,
      includeUncertainty,
    }

    try {
      // In a real scenario, this calls the API. For this UI demo, we simulate the calculation locally
      // to ensure the UI works without the backend.

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const rcInsights = calculateRCInsights(formData)

      setSimulationState({
        isRunning: false,
        results: { rcInsights },
        error: null,
      })
    } catch (error) {
      setSimulationState({
        isRunning: false,
        results: null,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const calculateRCInsights = (data: any) => {
    const deviceA = data.deviceA
    const deviceB = data.deviceB

    // Calculate daily energy consumption (kWh)
    const deviceADailyKwh =
      (deviceA.idleWatts * deviceA.idleHours +
        deviceA.normalWatts * deviceA.normalHours +
        deviceA.peakWatts * deviceA.peakHours) /
      1000

    const deviceBDailyKwh =
      (deviceB.idleWatts * deviceB.idleHours +
        deviceB.normalWatts * deviceB.normalHours +
        deviceB.peakWatts * deviceB.peakHours) /
      1000

    const yearlyKwhSavings = (deviceADailyKwh - deviceBDailyKwh) * 365
    const yearlyCO2Savings = yearlyKwhSavings * data.carbonFactor

    // Responsible Computing Metric: Water Usage Effectiveness (WUE) approximation
    // Traditional power generation consumes water. approx 3L per kWh is a conservative global avg.
    const yearlyWaterSavings = yearlyKwhSavings * 3

    const treesEquivalent = yearlyCO2Savings / 21 // ~21 kg CO2 absorbed per tree per year

    // Efficiency score (0-100)
    const efficiencyScore = Math.min(
      100,
      Math.max(0, Math.round(((deviceADailyKwh - deviceBDailyKwh) / deviceADailyKwh) * 100)),
    )

    // RC compliance level
    let complianceLevel: "poor" | "fair" | "good" | "excellent"
    if (efficiencyScore >= 40) complianceLevel = "excellent"
    else if (efficiencyScore >= 25) complianceLevel = "good"
    else if (efficiencyScore >= 10) complianceLevel = "fair"
    else complianceLevel = "poor"

    // Hardware lifecycle considerations (RC Principle: Longevity)
    const deviceALifecycleScore = Math.max(0, 100 - deviceA.age * 15) // Degrades 15% per year
    const deviceBLifecycleScore = 100

    return {
      energy: {
        deviceAKwh: Math.round(deviceADailyKwh * 365),
        deviceBKwh: Math.round(deviceBDailyKwh * 365),
        savingsKwh: Math.round(yearlyKwhSavings * 100) / 100,
      },
      financial: {
        deviceACost: Math.round(deviceADailyKwh * 365 * data.tariff),
        deviceBCost: Math.round(deviceBDailyKwh * 365 * data.tariff),
        savingsKes: Math.round(yearlyKwhSavings * data.tariff * 100) / 100,
      },
      environmentalImpact: {
        co2KgPerYear: Math.round(yearlyCO2Savings * 100) / 100,
        waterLitersPerYear: Math.round(yearlyWaterSavings * 100) / 100,
        treesEquivalent: Math.round(treesEquivalent * 10) / 10,
      },
      efficiencyScore,
      complianceLevel,
      lifecycleScores: {
        deviceA: deviceALifecycleScore,
        deviceB: deviceBLifecycleScore,
      },
      recommendations: generateRecommendations(deviceA, deviceB, efficiencyScore, complianceLevel),
    }
  }

  const generateRecommendations = (deviceA: any, deviceB: any, efficiencyScore: number, complianceLevel: string) => {
    const recommendations: string[] = []

    if (efficiencyScore > 30) {
      recommendations.push("✅ Strong case for replacement based on Energy Efficiency.")
    } else if (efficiencyScore > 15) {
      recommendations.push("⚠️ Moderate savings - consider replacement only if maintenance costs are high.")
    } else {
      recommendations.push("ℹ️ Minimal energy savings - extend current device life to reduce e-waste.")
    }

    if (deviceA.age > 5) {
      recommendations.push("♻️ Device A is nearing end-of-life. Ensure certified e-waste recycling.")
    }

    if (deviceB.idleWatts < deviceA.idleWatts * 0.5) {
      recommendations.push("⚡ Device B has superior idle efficiency (Green Software Principle).")
    }

    return recommendations
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sliders className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Device Comparison & Simulation</h1>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-muted-foreground">
            Analyze energy, carbon, and cost implications to make Responsible Computing decisions.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-card border-border">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-medium">Environmental & Grid Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Electricity Tariff (KSh/kWh)</label>
                <Input
                  type="number"
                  value={tariff}
                  onChange={(e) => setTariff(Number(e.target.value))}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Carbon Factor (kg CO₂/kWh)</label>
                <Input
                  type="number"
                  value={carbonFactor}
                  onChange={(e) => setCarbonFactor(Number(e.target.value))}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Hardware Degradation (%)</label>
                <Input
                  type="number"
                  value={degradationRate}
                  onChange={(e) => setDegradationRate(Number(e.target.value))}
                  className="bg-background"
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUncertainty}
                    onChange={(e) => setIncludeUncertainty(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground">Include Uncertainty Analysis</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Device A: Current/Existing */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-primary flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Device A (Current)
              </CardTitle>
              <CardDescription>Existing hardware metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Device Name</label>
                <Input
                  value={deviceAName}
                  onChange={(e) => setDeviceAName(e.target.value)}
                  className="mt-1 bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Age (Years)</label>
                  <Input
                    type="number"
                    value={deviceAAge}
                    onChange={(e) => setDeviceAAge(Number(e.target.value))}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Maintenance (KSh)</label>
                  <Input
                    type="number"
                    value={deviceAMaintenanceCost}
                    onChange={(e) => setDeviceAMaintenanceCost(Number(e.target.value))}
                    className="mt-1 bg-background"
                  />
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Power Draw (Watts)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Idle</span>
                    <Input
                      type="number"
                      value={deviceAIdleWatts}
                      onChange={(e) => setDeviceAIdleWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Normal</span>
                    <Input
                      type="number"
                      value={deviceANormalWatts}
                      onChange={(e) => setDeviceANormalWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Peak</span>
                    <Input
                      type="number"
                      value={deviceAPeakWatts}
                      onChange={(e) => setDeviceAPeakWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Usage (Hours/Day)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Idle</span>
                    <Input
                      type="number"
                      value={deviceAIdleHours}
                      onChange={(e) => setDeviceAIdleHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Normal</span>
                    <Input
                      type="number"
                      value={deviceANormalHours}
                      onChange={(e) => setDeviceANormalHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Peak</span>
                    <Input
                      type="number"
                      value={deviceAPeakHours}
                      onChange={(e) => setDeviceAPeakHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device B: Replacement/New */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-primary flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Device B (Replacement)
              </CardTitle>
              <CardDescription>Proposed hardware metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Device Name</label>
                <Input
                  value={deviceBName}
                  onChange={(e) => setDeviceBName(e.target.value)}
                  className="mt-1 bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Purchase Cost (KSh)</label>
                  <Input
                    type="number"
                    value={deviceBPurchaseCost}
                    onChange={(e) => setDeviceBPurchaseCost(Number(e.target.value))}
                    className="mt-1 bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Maintenance (KSh)</label>
                  <Input
                    type="number"
                    value={deviceBMaintenanceCost}
                    onChange={(e) => setDeviceBMaintenanceCost(Number(e.target.value))}
                    className="mt-1 bg-background"
                  />
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Power Draw (Watts)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Idle</span>
                    <Input
                      type="number"
                      value={deviceBIdleWatts}
                      onChange={(e) => setDeviceBIdleWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Normal</span>
                    <Input
                      type="number"
                      value={deviceBNormalWatts}
                      onChange={(e) => setDeviceBNormalWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Peak</span>
                    <Input
                      type="number"
                      value={deviceBPeakWatts}
                      onChange={(e) => setDeviceBPeakWatts(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Usage (Hours/Day)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Idle</span>
                    <Input
                      type="number"
                      value={deviceBIdleHours}
                      onChange={(e) => setDeviceBIdleHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Normal</span>
                    <Input
                      type="number"
                      value={deviceBNormalHours}
                      onChange={(e) => setDeviceBNormalHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Peak</span>
                    <Input
                      type="number"
                      value={deviceBPeakHours}
                      onChange={(e) => setDeviceBPeakHours(Number(e.target.value))}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12 text-center">
          <Button
            onClick={handleSimulationRun}
            disabled={simulationState.isRunning}
            size="lg"
            className="px-12 py-6 text-lg font-semibold"
          >
            {simulationState.isRunning ? "Calculating..." : "Run RC Simulation"}
          </Button>
        </div>

        {simulationState.results?.rcInsights && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold">Responsible Computing Insights</h3>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{simulationState.results.rcInsights.efficiencyScore}/100</div>
                  <Badge
                    className={`mt-2 ${
                      simulationState.results.rcInsights.complianceLevel === "excellent"
                        ? "bg-accent"
                        : simulationState.results.rcInsights.complianceLevel === "good"
                          ? "bg-primary"
                          : "bg-destructive/50"
                    }`}
                  >
                    {simulationState.results.rcInsights.complianceLevel.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> CO₂ Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {simulationState.results.rcInsights.environmentalImpact.co2KgPerYear}{" "}
                    <span className="text-lg">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">per year</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" /> Water Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {(simulationState.results.rcInsights.environmentalImpact.waterLitersPerYear / 1000).toFixed(1)}{" "}
                    <span className="text-lg">m³</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">per year</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Cost Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {simulationState.results.rcInsights.financial.savingsKes.toFixed(0)}{" "}
                    <span className="text-lg">KSh</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">per year</p>
                </CardContent>
              </Card>
            </div>

            {/* Energy Comparison */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Energy Consumption Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{deviceAName}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Annual Energy</span>
                          <span className="text-2xl font-bold">
                            {simulationState.results.rcInsights.energy.deviceAKwh}
                          </span>
                        </div>
                        <Progress value={100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">kWh/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Annual Cost:{" "}
                          <span className="font-bold text-foreground">
                            KSh {simulationState.results.rcInsights.financial.deviceACost}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{deviceBName}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Annual Energy</span>
                          <span className="text-2xl font-bold">
                            {simulationState.results.rcInsights.energy.deviceBKwh}
                          </span>
                        </div>
                        <Progress
                          value={
                            (simulationState.results.rcInsights.energy.deviceBKwh /
                              simulationState.results.rcInsights.energy.deviceAKwh) *
                            100
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">kWh/year</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Annual Cost:{" "}
                          <span className="font-bold text-accent">
                            KSh {simulationState.results.rcInsights.financial.deviceBCost}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 rounded p-4 border border-accent/30">
                  <p className="text-sm font-semibold text-accent mb-2">Potential Savings</p>
                  <p className="text-2xl font-bold text-accent">
                    {simulationState.results.rcInsights.energy.savingsKwh} kWh/year
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    KSh {simulationState.results.rcInsights.financial.savingsKes.toFixed(0)}/year
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {simulationState.results.rcInsights.recommendations.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {simulationState.results.rcInsights.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {simulationState.error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Simulation Error</p>
                <p className="text-sm text-destructive/90">{simulationState.error}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
