"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Device {
  device_class: string
  description: string
  power_rating_watts: number
  quantity: number
  hours_per_day: number
}

interface AuditFormProps {
  onSuccess?: () => void
}

export default function AuditForm({ onSuccess }: AuditFormProps) {
  const [auditName, setAuditName] = useState("")
  const [location, setLocation] = useState("")
  const [devices, setDevices] = useState<Device[]>([
    { device_class: "Lighting", description: "", power_rating_watts: 0, quantity: 1, hours_per_day: 8 },
  ])
  const [loading, setLoading] = useState(false)

  const handleAddDevice = () => {
    setDevices([
      ...devices,
      {
        device_class: "Servers",
        description: "",
        power_rating_watts: 0,
        quantity: 1,
        hours_per_day: 8,
      },
    ])
  }

  const handleRemoveDevice = (index: number) => {
    setDevices(devices.filter((_, i) => i !== index))
  }

  const handleDeviceChange = (index: number, field: keyof Device, value: any) => {
    const newDevices = [...devices]
    let finalValue = value
    if (field === "power_rating_watts" || field === "hours_per_day") {
      finalValue = value === "" ? 0 : Number.parseFloat(value)
    } else if (field === "quantity") {
      finalValue = value === "" ? 1 : Number.parseInt(value)
    }
    newDevices[index] = { ...newDevices[index], [field]: finalValue }
    setDevices(newDevices)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/audits/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audit_name: auditName,
          location,
          devices,
        }),
      })

      if (!response.ok) throw new Error("Failed to save audit")

      toast({ title: "Audit saved successfully" })
      setAuditName("")
      setLocation("")
      setDevices([{ device_class: "Lighting", description: "", power_rating_watts: 0, quantity: 1, hours_per_day: 8 }])

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("[v0] Error saving audit:", error)
      toast({ title: "Error saving audit", description: String(error), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Create Manual Audit</CardTitle>
        <CardDescription>Enter device specifications for energy audit</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audit Name</label>
              <Input
                type="text"
                placeholder="e.g., Lighting Audit 28/07/2025"
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                type="text"
                placeholder="e.g., Lab Building A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Devices</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDevice}
                className="gap-1 bg-transparent"
              >
                <Plus className="w-4 h-4" /> Add Device
              </Button>
            </div>

            {devices.map((device, index) => (
              <div key={index} className="p-4 bg-background border border-border rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Class</label>
                    <select
                      value={device.device_class}
                      onChange={(e) => handleDeviceChange(index, "device_class", e.target.value)}
                      className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
                    >
                      <option>Lighting</option>
                      <option>Servers</option>
                      <option>Workstations</option>
                      <option>HVAC</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <Input
                      placeholder="e.g., LED panels"
                      value={device.description}
                      onChange={(e) => handleDeviceChange(index, "description", e.target.value)}
                      className="bg-card border-border h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Power (W)</label>
                    <Input
                      type="number"
                      value={device.power_rating_watts || ""}
                      onChange={(e) => handleDeviceChange(index, "power_rating_watts", e.target.value)}
                      className="bg-card border-border h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={device.quantity || ""}
                      onChange={(e) => handleDeviceChange(index, "quantity", e.target.value)}
                      className="bg-card border-border h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hours/Day</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={device.hours_per_day || ""}
                      onChange={(e) => handleDeviceChange(index, "hours_per_day", e.target.value)}
                      className="bg-card border-border h-10"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveDevice(index)}
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Audit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
