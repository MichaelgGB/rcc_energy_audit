"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const CLASS_COLORS: Record<string, string> = {
  Lighting: "#f59e0b",
  Servers: "#3b82f6",
  Workstations: "#10b981",
  HVAC: "#ef4444",
  Networking: "#8b5cf6",
  Other: "#6b7280",
}

function getClassColor(cls: string, index: number) {
  return CLASS_COLORS[cls] ?? COLORS[index % COLORS.length]
}

export default function AuditAnalysis() {
  const { data: analysis, isLoading } = useSWR("/api/audits/analysis", fetcher)

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading analysis...</div>

  const hasLocationData = analysis?.labComparison?.length > 0
  const hasClassData = analysis?.deviceClassBreakdown?.length > 0
  const hasDeviceDetail = analysis?.deviceDetail?.length > 0

  if (!hasLocationData && !hasClassData) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No audit data available yet.</p>
        <p className="text-sm mt-2">Go to the <strong>Audit</strong> page and add devices with non-zero power ratings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Energy Consumption by Location */}
      {hasLocationData && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Energy Consumption by Location</CardTitle>
            <CardDescription>Daily kWh across labs (only locations with recorded consumption)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.labComparison} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="location"
                  stroke="#6b7280"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }}
                  formatter={(value: number) => [`${value.toFixed(2)} kWh`, "Daily kWh"]}
                />
                <Bar dataKey="totalKwh" fill="#10b981" name="Daily kWh" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Device Class Breakdown */}
      {hasClassData && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Equipment Breakdown by Device Class</CardTitle>
            <CardDescription>Energy consumption split by device category (only classes with recorded consumption)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.deviceClassBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? "?"} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="totalKwh"
                  nameKey="name"
                >
                  {analysis.deviceClassBreakdown.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getClassColor(entry.device_class, index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }}
                  formatter={(value: number) => [`${value.toFixed(2)} kWh/day`, "Consumption"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {analysis.deviceClassBreakdown.map((item: any, index: number) => {
                const totalKwh = analysis.deviceClassBreakdown.reduce((s: number, d: any) => s + d.totalKwh, 0)
                const pct = totalKwh > 0 ? ((item.totalKwh / totalKwh) * 100).toFixed(1) : "0"
                return (
                  <div
                    key={item.device_class}
                    className="flex items-center justify-between p-3 bg-background rounded border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getClassColor(item.device_class, index) }}
                      />
                      <span className="font-medium">{item.device_class}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-primary font-bold">{Number(item.totalKwh).toFixed(2)} kWh</span>
                      <span className="text-xs text-muted-foreground ml-2">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Device Detail Table */}
      {hasDeviceDetail && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Device Detail</CardTitle>
            <CardDescription>All individual devices across audits, sorted by consumption (highest first)</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 pr-4 font-medium">Location</th>
                  <th className="pb-2 pr-4 font-medium">Audit</th>
                  <th className="pb-2 pr-4 font-medium">Class</th>
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pr-4 font-medium text-right">Power (W)</th>
                  <th className="pb-2 pr-4 font-medium text-right">Hrs/Day</th>
                  <th className="pb-2 font-medium text-right">Daily kWh</th>
                </tr>
              </thead>
              <tbody>
                {analysis.deviceDetail.map((device: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-4 text-muted-foreground">{device.location}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs max-w-[140px] truncate" title={device.auditName}>
                      {device.auditName}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getClassColor(device.deviceClass, i) + "33",
                          color: getClassColor(device.deviceClass, i),
                        }}
                      >
                        {device.deviceClass}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{device.description || "—"}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{device.powerWatts}W</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{device.hoursPerDay}h</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-primary">{device.dailyKwh.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
