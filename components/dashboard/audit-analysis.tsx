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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AuditAnalysis() {
  const { data: analysis, isLoading } = useSWR("/api/audits/analysis", fetcher)

  if (isLoading) return <div className="text-center py-12">Loading analysis...</div>

  return (
    <div className="space-y-6">
      {/* Labs Comparison */}
      {analysis?.labComparison && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Energy Consumption by Location</CardTitle>
            <CardDescription>Daily kWh usage across different labs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.labComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="location" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }} />
                <Legend />
                <Bar dataKey="totalKwh" fill="#10b981" name="Daily kWh" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Device Class Breakdown */}
      {analysis?.deviceClassBreakdown && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Equipment Breakdown</CardTitle>
            <CardDescription>Energy consumption by device class</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.deviceClassBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#10b981"
                  dataKey="totalKwh"
                >
                  {analysis.deviceClassBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid #1f2937" }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {analysis.deviceClassBreakdown.map((item: any) => (
                <div
                  key={item.device_class}
                  className="flex items-center justify-between p-3 bg-background rounded border border-border"
                >
                  <span className="font-medium">{item.device_class}</span>
                  <span className="text-primary font-bold">
                    {Number.isFinite(Number(item.totalKwh)) ? Number(item.totalKwh).toFixed(2) : "0.00"} kWh
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
