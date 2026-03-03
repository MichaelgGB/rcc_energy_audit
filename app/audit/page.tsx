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
          <PageHelp title="How to Use the Audit Page" description="Enter device data or automate it with routines.">
            <h3 className="font-semibold text-foreground">✍️ Manual Audit Tab</h3>
            <p className="text-sm">Use this to record a snapshot of devices in a specific lab. Think of it as a one-time inventory scan.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li><strong>Device Class:</strong> Choose the type of device. The form fields will change to match its parameters (e.g. selecting "Workstations" shows Idle/Active/Peak watts).</li>
              <li><strong>Effective Power (W):</strong> This is automatically calculated from the detailed inputs — you don't need to enter it manually.</li>
              <li><strong>Quantity:</strong> How many of this exact device are in the room?</li>
              <li><strong>Description:</strong> Optional label like "Dell OptiPlex" or "60W LED Panel" to identify the device later.</li>
            </ul>
            <p className="mt-2 text-sm">Hit <strong>Add Device</strong> to add multiple device types in one audit. When done, click <strong>Save Audit</strong>.</p>

            <h3 className="font-semibold text-foreground mt-4">🔁 Create Routine Tab</h3>
            <p className="text-sm">A Routine is a one-time setup that will <em>auto-generate</em> audit entries for you (via the <code>routine-logger.js</code> script). Best for fixed assets like lights or servers.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li><strong>Frequency:</strong> Choose Daily, Hourly, or Weekly — this determines how often the routine creates a new log entry when the script runs.</li>
              <li><strong>Use case:</strong> "Lights are on 8 hours every day" — set it once here and never log it manually again.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-4">📤 Upload Telemetry Tab</h3>
            <p className="text-sm">Upload a <code>.csv</code> file exported from the telemetry collector scripts in the <code>/scripts</code> folder. This enables Predictions and advanced Dashboard analytics.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              <li>Required columns: <code>timestamp_utc</code>, <code>computer_name</code>, <code>cpu_percent</code>, <code>inferred_watts</code></li>
              <li>You can upload multiple times — data is appended, not replaced.</li>
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
