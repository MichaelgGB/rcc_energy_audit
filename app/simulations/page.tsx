"use client"
import { useState } from "react"
import { AlertCircle, Leaf, TrendingDown, CheckCircle, Droplets, DollarSign, Activity, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export interface RecommendationOutput {
  decision: "REPLACE" | "CAUTION" | "KEEP" | "INSUFFICIENT_DATA";
  confidence: "low" | "medium" | "high";
  scores: {
    totalScore: number;
    financialScore: number;
    lifecycleScore: number;
    energyScore: number;
    carbonScore: number;
  };
  reasons: string[];
}

const THRESHOLDS = {
  MINIMAL_SAVINGS: 5000,
  LOW_CONFIDENCE: 40
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function normalize(value: number, max: number) {
  if (max === 0) return 0
  return clamp(value / max)
}

function inverseNormalize(value: number, max: number) {
  if (max === 0) return 0
  return clamp(1 - value / max)
}

export function generateComprehensiveRecommendations(
  deviceA: any,
  deviceB: any,
  apiResult: any,
  payload: any,
  optimizationWeight: number = 100 // 0 to 100
): RecommendationOutput {
  const tcoSavings = apiResult.TCOA - apiResult.TCOB;
  const tcoSavingsPercent = apiResult.TCOA !== 0 ? (tcoSavings / apiResult.TCOA) * 100 : 0;

  const energyADailyKwh = apiResult.energyA.annualKwh;
  const efficiencyScore = energyADailyKwh > 0 ? Math.min(
    100,
    Math.max(0, Math.round(((energyADailyKwh - apiResult.energyB.annualKwh) / energyADailyKwh) * 100))
  ) : 0;

  let confidence: "low" | "medium" | "high" = "medium";
  if (apiResult.uncertaintyScore >= 70) confidence = "high";
  else if (apiResult.uncertaintyScore >= 50) confidence = "medium";
  else confidence = "low";

  // Simplified scoring - more intuitive
  const lifecycleScore = clamp(deviceA.age / deviceA.lifespan);
  
  // Financial: Positive if saves money, considers TCO and payback
  const tcoSavingsNormalized = tcoSavings > 0 ? Math.min(tcoSavings / 50000, 1) : 0;
  const paybackOK = apiResult.breakEvenMonths > 0 && apiResult.breakEvenMonths <= 72; // 6 years max
  const paybackScore = paybackOK ? Math.max(0, 1 - (apiResult.breakEvenMonths / 120)) : 0;
  let financialScore = clamp((tcoSavingsNormalized * 0.6) + (paybackScore * 0.4));
  
  // Energy: Normalize efficiency score (30%+ is excellent)
  const energyScore = clamp(efficiencyScore / 30);
  
  // Carbon: Normalize carbon savings (50kg+ per year is significant)
  const carbonScore = clamp(Math.max(apiResult.savings.carbonPerYear, 0) / 50);

  if (apiResult.uncertaintyScore < 60) {
    financialScore *= 0.85;
  }

  const w = optimizationWeight / 100;

  // Clearer weight distribution
  const weightFinancial = 0.10 + (0.70 * w);
  const weightLifecycle = 0.10;
  const weightEnergy = 0.50 - (0.45 * w);
  const weightCarbon = 0.30 - (0.25 * w);

  const totalScore =
    (weightFinancial * financialScore) +
    (weightLifecycle * lifecycleScore) +
    (weightEnergy * energyScore) +
    (weightCarbon * carbonScore);

  let decision: "REPLACE" | "CAUTION" | "KEEP" | "INSUFFICIENT_DATA" = "KEEP";
  if (totalScore >= 0.65) decision = "REPLACE";
  else if (totalScore >= 0.45) decision = "CAUTION";

  if (lifecycleScore > 0.85 && decision !== "KEEP") {
    decision = "REPLACE";
  }

  const reasons: string[] = [];

  // Data Quality Guardrail
  if (apiResult.uncertaintyScore < THRESHOLDS.LOW_CONFIDENCE) {
    decision = "INSUFFICIENT_DATA";
    reasons.push("❌ Failed data quality guardrail: Confidence is too low to recommend replacement.");
  } else {
    // Financial Guardrails logic
    const isFinanciallyUnviable =
      apiResult.savings.costPerYear < -THRESHOLDS.MINIMAL_SAVINGS ||
      apiResult.breakEvenMonths === -1 ||
      apiResult.breakEvenMonths > deviceB.lifespan * 12 ||
      (tcoSavings < 0 && Math.abs(tcoSavingsPercent) > 20);

    // Only apply hard financial guardrails if sustainability is NOT the clear priority (e.g., slider > 30)
    if (isFinanciallyUnviable) {
      if (optimizationWeight > 30) {
        decision = "KEEP";
        if (apiResult.savings.costPerYear < -THRESHOLDS.MINIMAL_SAVINGS) reasons.push(`❌ Financial Guardrail: Annual costs increase by ${Math.abs(Math.round(apiResult.savings.costPerYear)).toLocaleString()} KSh.`);
        else if (apiResult.breakEvenMonths === -1) reasons.push("❌ Financial Guardrail: This replacement will never break even.");
        else if (apiResult.breakEvenMonths > deviceB.lifespan * 12) reasons.push(`❌ Financial Guardrail: Returns take longer than the device lifespan (${apiResult.breakEvenMonths} months).`);
        else reasons.push(`Financial Guardrail: Total Cost of Ownership is significantly higher (${Math.abs(Math.round(tcoSavingsPercent)).toLocaleString()}%).`);
      } else {
        reasons.push("Financial Caution: Negative ROI, but recommending based on your strong sustainability preference.");
      }
    }
  }

  const scoresObj = { financialScore, lifecycleScore, energyScore, carbonScore };
  const dominantKey = (Object.keys(scoresObj) as Array<keyof typeof scoresObj>).reduce((a, b) =>
    scoresObj[a] > scoresObj[b] ? a : b
  );

  if (dominantKey === 'financialScore') reasons.push("Primary driver: Strong Return on Investment and Total Cost of Ownership savings.");
  else if (dominantKey === 'energyScore') reasons.push("Primary driver: Substantial energy efficiency improvements.");
  else if (dominantKey === 'lifecycleScore') reasons.push("Primary driver: Current device is nearing end-of-life.");
  else reasons.push("Primary driver: Significant carbon reduction and environmental benefits.");

  if (efficiencyScore > 30) {
    reasons.push("Strong case for replacement based on Energy Efficiency.");
  } else if (efficiencyScore > 15) {
    reasons.push("Moderate savings - consider replacement only if maintenance costs are high.");
  } else {
    reasons.push("ℹMinimal energy savings - extend current device life to reduce e-waste.");
  }

  if (deviceA.age > 5) {
    reasons.push("Device A is nearing end-of-life. Ensure certified e-waste recycling.");
  }

  if (deviceB.idlePower < deviceA.idlePower * 0.5) {
    reasons.push("⚡ Proposed device has superior idle efficiency.");
  }

  if (apiResult.savings.costPerYear > 0 && apiResult.breakEvenMonths > 60) {
    const paybackYears = Math.round((apiResult.breakEvenMonths / 12) * 10) / 10;
    reasons.push(`The payback period is relatively long (${paybackYears} years) compared to annual savings.`);
  }

  return {
    decision,
    confidence,
    scores: {
      totalScore: Math.round(totalScore * 100) / 100,
      financialScore: Math.round(financialScore * 100) / 100,
      lifecycleScore: Math.round(lifecycleScore * 100) / 100,
      energyScore: Math.round(energyScore * 100) / 100,
      carbonScore: Math.round(carbonScore * 100) / 100
    },
    reasons
  };
}

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
  const [discountRate, setDiscountRate] = useState<number>(5)
  const [inflationRate, setInflationRate] = useState<number>(3)
  const [salvageValuePercent, setSalvageValuePercent] = useState<number>(10)
  const [optimizationWeight, setOptimizationWeight] = useState<number>(100)

  // Device A (Existing - High Contrast: Red/Warm)
  const [deviceAName, setDeviceAName] = useState("Existing Device")
  const [deviceAAge, setDeviceAAge] = useState(3)
  const [deviceAPurchaseCost, setDeviceAPurchaseCost] = useState(50000)
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

    const payload = {
      deviceA: {
        name: deviceAName,
        deviceType: "unknown",
        powerRating: deviceANormalWatts,
        idlePower: deviceAIdleWatts,
        normalPower: deviceANormalWatts,
        peakPower: deviceAPeakWatts,
        age: deviceAAge,
        purchaseCost: deviceAPurchaseCost,
        lifespan: 10,  // Need a default lifespan for TCO calculation
        maintenanceCost: deviceAMaintenanceCost,
        usage: {
          idleHours: deviceAIdleHours,
          normalHours: deviceANormalHours,
          peakHours: deviceAPeakHours,
        },
        units: 1,
      },
      deviceB: {
        name: deviceBName,
        deviceType: "unknown",
        powerRating: deviceBNormalWatts,
        idlePower: deviceBIdleWatts,
        normalPower: deviceBNormalWatts,
        peakPower: deviceBPeakWatts,
        age: deviceBAge,
        purchaseCost: deviceBPurchaseCost,
        lifespan: 10,
        maintenanceCost: deviceBMaintenanceCost,
        usage: {
          idleHours: deviceBIdleHours,
          normalHours: deviceBNormalHours,
          peakHours: deviceBPeakHours,
        },
        units: 1,
      },
      tariff,
      carbonFactor,
      degradationRate,
      includeUncertainty,
      discountRate: discountRate / 100, // Convert percentage to decimal
      inflationRate: inflationRate / 100, // Convert percentage to decimal
      salvageValuePercent: salvageValuePercent / 100, // Convert percentage to decimal
    }

    try {
      const response = await fetch("/api/simulations/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Simulation calculation failed on server");
      }

      const backendData = await response.json();

      // Adapt backend data to frontend UI structure
      const rcInsights = mapBackendToFrontendMetrics(backendData, payload, optimizationWeight);

      setSimulationState({
        isRunning: false,
        results: { rcInsights },
        error: null,
      })
    } catch (error) {
      setSimulationState({
        isRunning: false,
        results: null,
        error: error instanceof Error ? error.message : "Network or server error",
      })
    }
  }

  const mapBackendToFrontendMetrics = (apiResult: any, payload: any, optWeight: number) => {
    const deviceA = payload.deviceA;
    const deviceB = payload.deviceB;

    // We can extract what the backend calculated.
    const energyADailyKwh = apiResult.energyA.annualKwh;
    const efficiencyScore = energyADailyKwh > 0 ? Math.min(
      100,
      Math.max(0, Math.round(((energyADailyKwh - apiResult.energyB.annualKwh) / energyADailyKwh) * 100))
    ) : 0;

    // RC compliance level
    let complianceLevel: "poor" | "fair" | "good" | "excellent"
    if (efficiencyScore >= 40) complianceLevel = "excellent"
    else if (efficiencyScore >= 25) complianceLevel = "good"
    else if (efficiencyScore >= 10) complianceLevel = "fair"
    else complianceLevel = "poor"

    const treesEquivalent = apiResult.savings.carbonPerYear / 21
    const yearlyWaterSavings = apiResult.savings.energyPerYear * 3

    // Calculate actual annual costs (energy + maintenance)
    const deviceAAnnualCost = Math.round((apiResult.energyA.annualKwh * payload.tariff) + deviceA.maintenanceCost)
    const deviceBAnnualCost = Math.round((apiResult.energyB.annualKwh * payload.tariff) + deviceB.maintenanceCost)

    return {
      energy: {
        deviceAKwh: Math.round(apiResult.energyA.annualKwh),
        deviceBKwh: Math.round(apiResult.energyB.annualKwh),
        savingsKwh: apiResult.savings.energyPerYear,
      },
      financial: {
        deviceACost: deviceAAnnualCost,
        deviceBCost: deviceBAnnualCost,
        savingsKes: apiResult.savings.costPerYear,
      },
      environmentalImpact: {
        co2KgPerYear: apiResult.savings.carbonPerYear,
        waterLitersPerYear: Math.round(yearlyWaterSavings * 100) / 100,
        treesEquivalent: Math.round(treesEquivalent * 10) / 10,
      },
      efficiencyScore,
      complianceLevel,
      lifecycleScores: {
        deviceA: Math.max(0, 100 - payload.deviceA.age * 15),
        deviceB: 100,
      },
      tco: { // Used in UI later
        deviceA: apiResult.TCOA,
        deviceB: apiResult.TCOB,
        breakEvenMonths: apiResult.breakEvenMonths
      },
      recommendations: generateComprehensiveRecommendations(deviceA, deviceB, apiResult, payload, optWeight),
    }
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

        <Card className="mb-8 bg-card border-border">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-medium">Financial Parameters (TCO)</CardTitle>
            <CardDescription className="text-xs">Configure time value of money and cost projections</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Discount Rate (%)</label>
                <Input
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="bg-background"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground mt-1">For NPV calculation (default: 5%)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Inflation Rate (%)</label>
                <Input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="bg-background"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground mt-1">Energy cost increase (default: 3%)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Salvage Value (%)</label>
                <Input
                  type="number"
                  value={salvageValuePercent}
                  onChange={(e) => setSalvageValuePercent(Number(e.target.value))}
                  className="bg-background"
                  step="1"
                />
                <p className="text-xs text-muted-foreground mt-1">End-of-life resale value (default: 10%)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex justify-between">
                  <span>Optimization Focus</span>
                  <span>{optimizationWeight}% ROI</span>
                </label>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={optimizationWeight}
                    onChange={(e) => setOptimizationWeight(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Sustainability (0%)</span>
                    <span>Financial (100%)</span>
                  </div>
                </div>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Purchase Cost (KSh)</label>
                  <Input
                    type="number"
                    value={deviceAPurchaseCost}
                    onChange={(e) => setDeviceAPurchaseCost(Number(e.target.value))}
                    className="mt-1 bg-background"
                  />
                </div>
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
                    className={`mt-2 ${simulationState.results.rcInsights.complianceLevel === "excellent"
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
                    {simulationState.results.rcInsights.environmentalImpact.waterLitersPerYear.toFixed(1)}{" "}
                    <span className="text-lg">Litres</span>
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

            {/* Energy Comparison & TCO */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Energy Consumption & Total Cost of Ownership (10 Years)</CardTitle>
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
                            KSh {simulationState.results.rcInsights.financial.deviceACost.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          Total Cost of Ownership (10 Yrs):{" "}
                          <span className="font-bold text-foreground">
                            KSh {simulationState.results.rcInsights.tco.deviceA.toLocaleString()}
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
                            KSh {simulationState.results.rcInsights.financial.deviceBCost.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          Total Cost of Ownership (10 Yrs):{" "}
                          <span className="font-bold text-accent">
                            KSh {simulationState.results.rcInsights.tco.deviceB.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 rounded p-4 border border-accent/30 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-accent mb-2">Potential Savings</p>
                    <p className="text-2xl font-bold text-accent">
                      {simulationState.results.rcInsights.energy.savingsKwh} kWh/year
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      KSh {simulationState.results.rcInsights.financial.savingsKes.toLocaleString()}/year
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary mb-2">ROI Break-Even</p>
                    <p className="text-2xl font-bold text-primary">
                      {simulationState.results.rcInsights.tco.breakEvenMonths > 0
                        ? `${simulationState.results.rcInsights.tco.breakEvenMonths} Months`
                        : 'Immediate/N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {simulationState.results.rcInsights.recommendations && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Comprehensive Recommendation</span>
                    <Badge variant="outline" className={
                      simulationState.results.rcInsights.recommendations.decision === "REPLACE" ? "bg-primary text-primary-foreground border-primary" :
                        simulationState.results.rcInsights.recommendations.decision === "CAUTION" ? "bg-amber-500/10 text-amber-500 border-amber-500/50" :
                          "bg-muted text-muted-foreground"
                    }>
                      {simulationState.results.rcInsights.recommendations.decision}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex gap-6 text-sm">
                    <div className="bg-accent/10 px-3 py-2 rounded border border-accent/20">
                      <strong className="text-accent">Score:</strong>{" "}
                      <span className="text-lg font-bold">
                        {simulationState.results.rcInsights.recommendations.scores.totalScore}
                      </span>
                    </div>
                    <div className="bg-muted px-3 py-2 rounded border border-border">
                      <strong className="text-muted-foreground">Confidence:</strong>{" "}
                      <span className="uppercase font-semibold">
                        {simulationState.results.rcInsights.recommendations.confidence}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {simulationState.results.rcInsights.recommendations.reasons.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{rec}</span>
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
