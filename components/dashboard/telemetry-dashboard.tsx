"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TelemetryDashboard() {
  const { data: telemetry, isLoading } = useSWR("/api/metrics/analysis", fetcher)

  if (isLoading) return <div className="text-center py-12">Loading telemetry data...</div>

  return (
    <div className="space-y-6">
      {/* Time Series Power Draw */}
      {telemetry?.timeSeriesData && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Inferred Watts Over Time</CardTitle>
            <CardDescription>Real-time power consumption patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={telemetry.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inferred_watts"
                  stroke="#10b981"
                  name="Inferred Watts"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* CPU vs Power Correlation */}
      {telemetry?.cpuPowerCorrelation && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>CPU Usage vs Power Draw</CardTitle>
            <CardDescription>Correlation between activity and energy consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={telemetry.cpuPowerCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu_percent"
                  stroke="#3b82f6"
                  name="CPU %"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="inferred_watts"
                  stroke="#10b981"
                  name="Watts"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Power Consumption by Computer */}
      {telemetry?.computerStats && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Peak Usage by Workstation</CardTitle>
            <CardDescription>Identify problem machines with high consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={telemetry.computerStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="computer_name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }} />
                <Legend />
                <Bar dataKey="avgWatts" fill="#10b981" name="Avg Watts" />
                <Bar dataKey="maxWatts" fill="#ef4444" name="Peak Watts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Idle Waste Detection */}
      {telemetry?.idleAnalysis && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Idle Waste Detection</CardTitle>
            <CardDescription>Machines using energy when idle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {telemetry.idleAnalysis.map((item: any) => (
                <div
                  key={item.computer_name}
                  className="flex items-center justify-between p-4 bg-background rounded border border-border"
                >
                  <div>
                    <p className="font-medium">{item.computer_name}</p>
                    <p className="text-sm text-muted">{item.idleHours} hours idle detected</p>
                  </div>
                  <span className="text-warning font-bold">{item.estimatedWastedWatts} W</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
