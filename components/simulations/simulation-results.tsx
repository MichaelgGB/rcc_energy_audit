"use client"

import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface SimulationResults {
  energyA: {
    annualKwh: number
    lifetimeKwh: number
    idleKwh: number
    normalKwh: number
    peakKwh: number
  }
  energyB: {
    annualKwh: number
    lifetimeKwh: number
    idleKwh: number
    normalKwh: number
    peakKwh: number
  }
  TCOA: number
  TCOB: number
  breakEvenMonths: number
  carbonA: number
  carbonB: number
  uncertaintyScore: number
  savings: {
    energyPerYear: number
    costPerYear: number
    carbonPerYear: number
  }
}

interface SimulationResultsProps {
  results: SimulationResults
  deviceAName: string
  deviceBName: string
}

export default function SimulationResults({
  results,
  deviceAName = "Existing Device",
  deviceBName = "Proposed Device",
}: SimulationResultsProps) {
  const confidenceColor =
    results.uncertaintyScore > 70
      ? "text-green-600"
      : results.uncertaintyScore > 40
        ? "text-yellow-600"
        : "text-red-600"
  const confidenceLabel = results.uncertaintyScore > 70 ? "High" : results.uncertaintyScore > 40 ? "Medium" : "Low"

  const energyChartData = [
    { name: "Device A", annual: results.energyA.annualKwh, lifetime: results.energyA.lifetimeKwh },
    { name: "Device B", annual: results.energyB.annualKwh, lifetime: results.energyB.lifetimeKwh },
  ]

  const costChartData = [
    { name: deviceAName || "Device A", value: Math.round(results.TCOA) },
    { name: deviceBName || "Device B", value: Math.round(results.TCOB) },
  ]

  const pieData = [
    { name: "Idle", value: results.energyA.idleKwh },
    { name: "Normal", value: results.energyA.normalKwh },
    { name: "Peak", value: results.energyA.peakKwh },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

  const handleExportPDF = () => {
    alert("PDF export coming soon")
  }

  const handleCopySummary = () => {
    const summary = `
Energy Simulation Results
========================

${deviceAName} vs ${deviceBName}

ENERGY CONSUMPTION:
- ${deviceAName} Annual: ${results.energyA.annualKwh} kWh
- ${deviceBName} Annual: ${results.energyB.annualKwh} kWh
- Annual Savings: ${results.savings.energyPerYear} kWh

COST ANALYSIS:
- ${deviceAName} TCO: KSh ${Math.round(results.TCOA).toLocaleString()}
- ${deviceBName} TCO: KSh ${Math.round(results.TCOB).toLocaleString()}
- Annual Savings: KSh ${Math.round(results.savings.costPerYear).toLocaleString()}
- Break-even: ${results.breakEvenMonths} months

CARBON FOOTPRINT:
- ${deviceAName} Annual CO₂: ${results.carbonA} kg
- ${deviceBName} Annual CO₂: ${results.carbonB} kg
- Annual Reduction: ${results.savings.carbonPerYear} kg CO₂

Confidence Score: ${results.uncertaintyScore}% (${confidenceLabel})
    `
    navigator.clipboard.writeText(summary)
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Export Actions */}
      <div className="flex gap-2 justify-end">
        <Button onClick={handleCopySummary} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Copy className="w-4 h-4" />
          Copy Summary
        </Button>
        <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Energy Consumption Summary */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Energy Consumption Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Annual Consumption</p>
            <p className="text-2xl font-bold text-foreground">
              {results.savings.energyPerYear.toLocaleString()} kWh saved
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {((results.savings.energyPerYear / results.energyA.annualKwh) * 100).toFixed(1)}% reduction
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Lifetime Savings</p>
            <p className="text-2xl font-bold text-foreground">
              {(results.energyA.lifetimeKwh - results.energyB.lifetimeKwh).toLocaleString()} kWh
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Energy Breakdown</p>
            <div className="text-sm space-y-1">
              <p>Idle: {results.energyA.idleKwh.toLocaleString()} kWh</p>
              <p>Normal: {results.energyA.normalKwh.toLocaleString()} kWh</p>
              <p>Peak: {results.energyA.peakKwh.toLocaleString()} kWh</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={energyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="annual" fill="#8884d8" name="Annual (kWh)" />
            <Bar dataKey="lifetime" fill="#82ca9d" name="Lifetime (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost Analysis */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Cost Analysis - Total Cost of Ownership</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Annual Cost Savings</p>
            <p className="text-2xl font-bold text-green-600">
              KSh {Math.round(results.savings.costPerYear).toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Break-even</p>
            <p className="text-2xl font-bold text-foreground">
              {results.breakEvenMonths > 0 ? `${results.breakEvenMonths} months` : "N/A"}
            </p>
            {results.breakEvenMonths > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Payback period for device replacement</p>
            )}
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">TCO Comparison</p>
            <p className="text-xs space-y-1">
              <span className="block">Device A: KSh {Math.round(results.TCOA).toLocaleString()}</span>
              <span className="block">Device B: KSh {Math.round(results.TCOB).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
            <Bar dataKey="value" fill="#ffc658" name="Total Cost (KSh)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Carbon Footprint */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Carbon Footprint Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Annual CO₂ Reduction</p>
            <p className="text-2xl font-bold text-green-600">{results.savings.carbonPerYear.toLocaleString()} kg</p>
            <p className="text-xs text-muted-foreground mt-2">
              {((results.savings.carbonPerYear / results.carbonA) * 100).toFixed(1)}% reduction
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Device A Annual</p>
            <p className="text-xl font-bold text-foreground">{results.carbonA.toLocaleString()} kg CO₂</p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Device B Annual</p>
            <p className="text-xl font-bold text-foreground">{results.carbonB.toLocaleString()} kg CO₂</p>
          </div>
        </div>
      </Card>

      {/* Uncertainty/Confidence Score */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Confidence Analysis</h3>
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-green-500 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${confidenceColor}`}>{results.uncertaintyScore}%</span>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${confidenceColor}`}>{confidenceLabel} Confidence</p>
                  <p className="text-sm text-muted-foreground">
                    {confidenceLabel === "High" && "High reliability in results"}
                    {confidenceLabel === "Medium" && "Moderate reliability in results"}
                    {confidenceLabel === "Low" && "Low reliability - consider gathering more data"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Device State Distribution */}
      <Card className="p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Device State Distribution - {deviceAName}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${Math.round(value)} kWh`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${Math.round(value as number)} kWh`} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
