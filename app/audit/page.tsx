"use client"

import { useState } from "react"
import AuditForm from "@/components/audit/audit-form"
import AuditList from "@/components/audit/audit-list"
import TelemetryUpload from "@/components/audit/telemetry-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PageHelp } from "@/components/page-help"

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("manual")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAuditCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Energy Audits</h1>
            <p className="text-muted mt-2">Manage manual audits and upload telemetry data</p>
          </div>
          <PageHelp title="Audit & Telemetry Guide" description="How to input and manage your baseline and dynamic data.">
            <h3 className="font-semibold text-foreground">What is an Energy Audit?</h3>
            <p>
              An energy audit is a comprehensive assessment of energy consumption in your computing infrastructure. This page serves as the data entry point for all energy measurements, either through manual input or automated telemetry uploads.
            </p>

            <h3 className="font-semibold text-foreground mt-4">Manual Audits</h3>
            <p>
              Manual audits allow you to create a static baseline for a specific location (e.g., "C4D Lab"). You enter the specifications of the hardware located there:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Device Name:</strong> Identifier for the equipment (e.g., "Dell Desktop" or "LED Panel")</li>
              <li><strong>Device Class:</strong> Category like Lighting, Computing, HVAC, Servers, or Networking</li>
              <li><strong>Power Rating (Watts):</strong> The power consumption of the device during operation</li>
              <li><strong>Usage Hours/Day:</strong> Expected daily runtime of the device</li>
              <li><strong>Units:</strong> Number of identical devices in this category</li>
            </ul>
            <p className="mt-2">
              The system automatically calculates the <strong>Daily kWh footprint</strong> using the formula: <code>(Power Rating × Usage Hours × Units) ÷ 1000</code>. This data feeds into dashboard analytics, carbon reports, and comparison simulations.
            </p>

            <h3 className="font-semibold text-foreground mt-4">Telemetry Upload</h3>
            <p>
              Telemetry represents real-time dynamic workstation metrics collected from actual running systems. Unlike manual audits which are estimates, telemetry provides precise measurements.
            </p>
            <p className="mt-2">
              <strong>How to collect telemetry:</strong> Use the Python script (<code>telemetry-collector.py</code>) or shell script (<code>telemetry-collector.sh</code>) provided in the <code>/scripts</code> directory to automatically gather system metrics from your lab computers.
            </p>
            <p className="mt-2">
              <strong>CSV Format:</strong> Your upload file should contain these fields:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><code>timestamp_utc</code>: ISO timestamp of the measurement</li>
              <li><code>computer_name</code>: Hostname or identifier of the machine</li>
              <li><code>cpu_percent</code>: CPU utilization percentage (0-100)</li>
              <li><code>memory_percent</code>: RAM usage percentage</li>
              <li><code>inferred_watts</code>: Calculated power consumption based on hardware specs and CPU load</li>
            </ul>
            <p className="mt-2">
              Once uploaded, telemetry data powers the Predictions, Recommendations, and advanced Dashboard analytics, enabling idle waste detection, anomaly identification, and optimization strategies.
            </p>

            <h3 className="font-semibold text-foreground mt-4">Best Practices</h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Start with manual audits to establish a baseline inventory</li>
              <li>Deploy telemetry collection on representative machines from each lab</li>
              <li>Upload telemetry data regularly (weekly or monthly) for trend analysis</li>
              <li>Review the audit list to track historical changes and location-specific consumption</li>
            </ul>
          </PageHelp>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Audit</TabsTrigger>
            <TabsTrigger value="routine">Create Routine</TabsTrigger>
            <TabsTrigger value="telemetry">Upload Telemetry</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AuditForm onSuccess={handleAuditCreated} />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Manual Audit Guide</h3>
                  <ul className="space-y-3 text-sm text-muted">
                    <li>• Enter audit name and location</li>
                    <li>• Add devices by category (Lighting, Servers, etc.)</li>
                    <li>• Specify power ratings and usage hours</li>
                    <li>• System calculates daily kWh automatically</li>
                    <li>• Save to track historical audits</li>
                  </ul>
                </div>
              </div>
            </div>
            <AuditList key={refreshKey} />
          </TabsContent>

          <TabsContent value="routine" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AuditForm isRoutine onSuccess={handleAuditCreated} />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Routine Guide</h3>
                  <ul className="space-y-3 text-sm text-muted">
                    <li>• Automate your audits instead of entering them daily</li>
                    <li>• Best for stationary assets like Lighting or Servers</li>
                    <li>• Define device power characteristics</li>
                    <li>• Choose a frequency (e.g. Daily)</li>
                    <li>• System auto-logs consumption automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="telemetry" className="mt-8">
            <TelemetryUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
