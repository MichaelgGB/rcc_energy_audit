"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TelemetryUpload() {
  const [csvData, setCsvData] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvData.trim()) {
      toast({ title: "Please enter CSV data", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/metrics/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_csv_data: csvData }),
      })

      if (!response.ok) throw new Error("Failed to ingest telemetry")

      toast({ title: "Telemetry data ingested successfully" })
      setCsvData("")
    } catch (error) {
      toast({ title: "Error ingesting data", description: String(error), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Upload Telemetry Data</CardTitle>
        <CardDescription>Paste multi-line CSV data from workstations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex gap-2 mb-3 text-sm text-muted">
              <AlertCircle className="w-4 h-4 kkkkkkkkkkkkkkk mt-0.5" />
              <div>
                <p className="font-medium">Expected CSV format:</p>
                <code className="text-xs block mt-1">
                  timestamp_utc,computer_name,cpu_percent,mem_percent_used,disk_bytes_sec,inferred_watts
                </code>
              </div>
            </div>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="2025-01-15T10:30:00Z,LAB-PC-01,45.2,62.1,1024000,250.5
2025-01-15T10:31:00Z,LAB-PC-01,48.1,63.2,1052000,260.3
2025-01-15T10:32:00Z,LAB-PC-02,12.5,34.2,512000,85.2"
              className="w-full h-40 bg-card border border-border rounded px-3 py-2 text-sm font-mono"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Upload className="w-4 h-4" />
            {loading ? "Uploading..." : "Upload Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
