"use client"

import { useState } from "react"
import { 
  AlertCircle, 
  BarChart3, 
  Zap, 
  HelpCircle, 
  Leaf, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  DollarSign, 
  Recycle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const rcInsights = calculateRCInsights(formData);
      
      setSimulationState({ 
        isRunning: false, 
        results: { rcInsights }, 
        error: null 
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
    const deviceADailyKwh = (
      (deviceA.idleWatts * deviceA.idleHours) +
      (deviceA.normalWatts * deviceA.normalHours) +
      (deviceA.peakWatts * deviceA.peakHours)
    ) / 1000
    
    const deviceBDailyKwh = (
      (deviceB.idleWatts * deviceB.idleHours) +
      (deviceB.normalWatts * deviceB.normalHours) +
      (deviceB.peakWatts * deviceB.peakHours)
    ) / 1000
    
    const yearlyKwhSavings = (deviceADailyKwh - deviceBDailyKwh) * 365
    const yearlyCO2Savings = yearlyKwhSavings * data.carbonFactor
    
    // Responsible Computing Metric: Water Usage Effectiveness (WUE) approximation
    // Traditional power generation consumes water. approx 3L per kWh is a conservative global avg.
    const yearlyWaterSavings = yearlyKwhSavings * 3 
    
    const treesEquivalent = yearlyCO2Savings / 21 // ~21 kg CO2 absorbed per tree per year
    
    // Efficiency score (0-100)
    const efficiencyScore = Math.min(100, Math.max(0, Math.round(
      ((deviceADailyKwh - deviceBDailyKwh) / deviceADailyKwh) * 100
    )))
    
    // RC compliance level
    let complianceLevel: "poor" | "fair" | "good" | "excellent"
    if (efficiencyScore >= 40) complianceLevel = "excellent"
    else if (efficiencyScore >= 25) complianceLevel = "good"
    else if (efficiencyScore >= 10) complianceLevel = "fair"
    else complianceLevel = "poor"
    
    // Hardware lifecycle considerations (RC Principle: Longevity)
    const deviceALifecycleScore = Math.max(0, 100 - (deviceA.age * 15)) // Degrades 15% per year
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
    
    if (deviceB.idleWatts < (deviceA.idleWatts * 0.5)) {
      recommendations.push("⚡ Device B has superior idle efficiency (Green Software Principle).")
    }
    
    return recommendations
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">RC Energy Audit</h1>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" className="text-black">Dashboard</Button>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">Simulations</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Device Comparison & RC Analysis</h2>
          <p className="text-slate-600">
            Analyze energy, carbon, and cost implications to make Responsible Computing decisions.
          </p>
        </div>

        {/* Settings Panel */}
        <Card className="mb-8 bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle className="text-lg font-medium text-black">Environmental & Grid Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Electricity Tariff (KSh/kWh)</label>
                <Input type="number" value={tariff} onChange={(e) => setTariff(Number(e.target.value))} className="bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Carbon Factor (kg CO₂/kWh)</label>
                <Input type="number" value={carbonFactor} onChange={(e) => setCarbonFactor(Number(e.target.value))} className="bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Hardware Degradation (%)</label>
                <Input type="number" value={degradationRate} onChange={(e) => setDegradationRate(Number(e.target.value))} className="bg-white" />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeUncertainty} onChange={(e) => setIncludeUncertainty(e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-slate-600">Include Uncertainty Analysis</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Device A: The "Bad/Old" Option */}
          <Card className="bg-white shadow-lg border-t-4 border-t-red-500">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Device A (Current)
              </CardTitle>
              <CardDescription className="text-red-700">Existing hardware metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Device Name</label>
                <Input value={deviceAName} onChange={(e) => setDeviceAName(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold uppercase text-slate-500">Age (Years)</label>
                   <Input type="number" value={deviceAAge} onChange={(e) => setDeviceAAge(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-slate-500">Maintenance (KSh)</label>
                   <Input type="number" value={deviceAMaintenanceCost} onChange={(e) => setDeviceAMaintenanceCost(Number(e.target.value))} className="mt-1" />
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Power Draw (Watts)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-xs text-slate-500 block">Idle</span><Input type="number" value={deviceAIdleWatts} onChange={(e) => setDeviceAIdleWatts(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Normal</span><Input type="number" value={deviceANormalWatts} onChange={(e) => setDeviceANormalWatts(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Peak</span><Input type="number" value={deviceAPeakWatts} onChange={(e) => setDeviceAPeakWatts(Number(e.target.value))} /></div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Usage (Hours/Day)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-xs text-slate-500 block">Idle</span><Input type="number" value={deviceAIdleHours} onChange={(e) => setDeviceAIdleHours(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Normal</span><Input type="number" value={deviceANormalHours} onChange={(e) => setDeviceANormalHours(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Peak</span><Input type="number" value={deviceAPeakHours} onChange={(e) => setDeviceAPeakHours(Number(e.target.value))} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device B: The "Good/New" Option */}
          <Card className="bg-white shadow-lg border-t-4 border-t-green-500">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-green-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Device B (Replacement)
              </CardTitle>
              <CardDescription className="text-green-700">Proposed hardware metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Device Name</label>
                <Input value={deviceBName} onChange={(e) => setDeviceBName(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold uppercase text-slate-500">Purchase Cost (KSh)</label>
                   <Input type="number" value={deviceBPurchaseCost} onChange={(e) => setDeviceBPurchaseCost(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-slate-500">Maintenance (KSh)</label>
                   <Input type="number" value={deviceBMaintenanceCost} onChange={(e) => setDeviceBMaintenanceCost(Number(e.target.value))} className="mt-1" />
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Power Draw (Watts)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-xs text-slate-500 block">Idle</span><Input type="number" value={deviceBIdleWatts} onChange={(e) => setDeviceBIdleWatts(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Normal</span><Input type="number" value={deviceBNormalWatts} onChange={(e) => setDeviceBNormalWatts(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Peak</span><Input type="number" value={deviceBPeakWatts} onChange={(e) => setDeviceBPeakWatts(Number(e.target.value))} /></div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Usage (Hours/Day)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-xs text-slate-500 block">Idle</span><Input type="number" value={deviceBIdleHours} onChange={(e) => setDeviceBIdleHours(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Normal</span><Input type="number" value={deviceBNormalHours} onChange={(e) => setDeviceBNormalHours(Number(e.target.value))} /></div>
                  <div><span className="text-xs text-slate-500 block">Peak</span><Input type="number" value={deviceBPeakHours} onChange={(e) => setDeviceBPeakHours(Number(e.target.value))} /></div>
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
            className="bg-slate-900 text-white hover:bg-slate-800 px-12 py-6 text-lg font-semibold shadow-xl rounded-full"
          >
            {simulationState.isRunning ? "Calculating..." : "Run RC Simulation"}
          </Button>
        </div>

        {/* RESULTS SECTION */}
        {simulationState.results?.rcInsights && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-slate-900">Responsible Computing Insights</h3>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Efficiency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{simulationState.results.rcInsights.efficiencyScore}/100</div>
                  <Badge className={`mt-2 ${
                    simulationState.results.rcInsights.complianceLevel === 'excellent' ? 'bg-green-600' : 
                    simulationState.results.rcInsights.complianceLevel === 'good' ? 'bg-blue-600' : 'bg-orange-500'
                  }`}>
                    {simulationState.results.rcInsights.complianceLevel.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                     <TrendingDown className="w-4 h-4" /> CO₂ Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {simulationState.results.rcInsights.environmentalImpact.co2KgPerYear} <span className="text-sm font-normal text-slate-500">kg/yr</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Equivalent to {simulationState.results.rcInsights.environmentalImpact.treesEquivalent} trees planted</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-cyan-500 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Droplets className="w-4 h-4" /> Est. Water Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-700">
                    {simulationState.results.rcInsights.environmentalImpact.waterLitersPerYear} <span className="text-sm font-normal text-slate-500">L/yr</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Indirect water usage from power generation</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Annual Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700">
                    {simulationState.results.rcInsights.financial.savingsKes.toLocaleString()} <span className="text-sm font-normal text-slate-500">KSh</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Based on current tariff</p>
                </CardContent>
              </Card>
            </div>

            {/* Lifecycle Health (Visual Distinction) */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white shadow-md">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Recycle className="w-5 h-5 text-slate-500" />
                     Lifecycle Health
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-red-900">{deviceAName} (Old)</span>
                        <span className="text-sm font-bold text-red-600">{simulationState.results.rcInsights.lifecycleScores.deviceA}% Health</span>
                      </div>
                      {/* Custom Red Progress Bar */}
                      <div className="h-3 w-full bg-red-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all duration-500" 
                          style={{ width: `${simulationState.results.rcInsights.lifecycleScores.deviceA}%` }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">{deviceBName} (New)</span>
                        <span className="text-sm font-bold text-green-600">{simulationState.results.rcInsights.lifecycleScores.deviceB}% Health</span>
                      </div>
                      {/* Custom Green Progress Bar */}
                      <div className="h-3 w-full bg-green-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500" 
                          style={{ width: `${simulationState.results.rcInsights.lifecycleScores.deviceB}%` }} 
                        />
                      </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-slate-50 border border-slate-200">
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {simulationState.results.rcInsights.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-2 bg-white rounded border border-slate-100 shadow-sm">
                        <span className="text-sm text-slate-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Table (Distinct Contrast) */}
            <Card className="overflow-hidden">
               <CardHeader className="bg-slate-100">
                 <CardTitle>Direct Comparison</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                       <tr>
                         <th className="px-6 py-3">Metric</th>
                         <th className="px-6 py-3 text-red-700 bg-red-50">Device A</th>
                         <th className="px-6 py-3 text-green-700 bg-green-50">Device B</th>
                         <th className="px-6 py-3">Delta</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr className="bg-white border-b hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium">Annual Energy</td>
                         <td className="px-6 py-4 text-red-600">{simulationState.results.rcInsights.energy.deviceAKwh.toLocaleString()} kWh</td>
                         <td className="px-6 py-4 text-green-600">{simulationState.results.rcInsights.energy.deviceBKwh.toLocaleString()} kWh</td>
                         <td className="px-6 py-4 font-bold text-green-600">-{simulationState.results.rcInsights.energy.savingsKwh.toLocaleString()} kWh</td>
                       </tr>
                       <tr className="bg-white border-b hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium">Annual OpEx (Power)</td>
                         <td className="px-6 py-4 text-red-600">KSh {simulationState.results.rcInsights.financial.deviceACost.toLocaleString()}</td>
                         <td className="px-6 py-4 text-green-600">KSh {simulationState.results.rcInsights.financial.deviceBCost.toLocaleString()}</td>
                         <td className="px-6 py-4 font-bold text-green-600">Save KSh {simulationState.results.rcInsights.financial.savingsKes.toLocaleString()}</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </CardContent>
            </Card>

          </div>
        )}
      </main>
    </div>
  )
}