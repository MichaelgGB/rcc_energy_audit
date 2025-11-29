"use client"

import { useState } from "react"
import AuditForm from "@/components/audit/audit-form"
import AuditList from "@/components/audit/audit-list"
import TelemetryUpload from "@/components/audit/telemetry-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("manual")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAuditCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">Energy Audits</h1>
          <p className="text-muted mt-2">Manage manual audits and upload telemetry data</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Audit</TabsTrigger>
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

          <TabsContent value="telemetry" className="mt-8">
            <TelemetryUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
