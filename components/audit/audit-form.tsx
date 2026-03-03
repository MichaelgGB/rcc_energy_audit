"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DeviceParameters, type DeviceParams } from "./device-parameters"

interface Device {
  device_class: string
  description: string
  power_rating_watts: number
  quantity: number
  hours_per_day: number
  parameters?: DeviceParams
}

interface AuditFormProps {
  onSuccess?: () => void
  isRoutine?: boolean
}

export default function AuditForm({ onSuccess, isRoutine = false }: AuditFormProps) {
  const [auditName, setAuditName] = useState("")
  const [location, setLocation] = useState("")
  const [frequency, setFrequency] = useState("Daily")
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

  const handleDeviceComputed = useCallback((index: number, effectiveWatts: number, effectiveHours: number, params: DeviceParams) => {
    setDevices((prev) => {
      const current = prev[index]
      if (!current) return prev

      if (
        current.power_rating_watts === effectiveWatts &&
        current.hours_per_day === effectiveHours &&
        JSON.stringify(current.parameters) === JSON.stringify(params)
      ) {
        return prev
      }

      const newDevices = [...prev]
      newDevices[index] = {
        ...current,
        power_rating_watts: effectiveWatts,
        hours_per_day: effectiveHours,
        parameters: params
      }
      return newDevices
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isRoutine ? "/api/routines/save" : "/api/audits/save"
      const payload = isRoutine
        ? { audit_name: auditName, location, frequency, devices }
        : { audit_name: auditName, location, devices }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(isRoutine ? "Failed to save routine" : "Failed to save audit")

      toast({ title: isRoutine ? "Routine saved successfully" : "Audit saved successfully" })
      setAuditName("")
      setLocation("")
      setFrequency("Daily")
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
        <CardTitle>{isRoutine ? "Create Automatic Routine" : "Create Manual Audit"}</CardTitle>
        <CardDescription>{isRoutine ? "Set up scheduled data logging" : "Enter device specifications for energy audit"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={isRoutine ? "lg:col-span-1" : "sm:col-span-2 lg:col-span-1"}>
              <label className="block text-sm font-medium mb-2">{isRoutine ? "Routine Name" : "Audit Name"}</label>
              <Input
                type="text"
                placeholder={isRoutine ? "e.g., Daily Lighting Log" : "e.g., Lighting Audit 28/07/2025"}
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm h-10"
                required
              >
                <option value="">Select a location</option>
                <option>Undergraduate Lab</option>
                <option>Masters Lab</option>
                <option>PhD Lab</option>
                <option>C4D Lab</option>
              </select>
            </div>
            {isRoutine && (
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm h-10"
                  required
                >
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
            )}
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
                      <option value="Lighting">Lighting</option>
                      <option value="Servers">Servers</option>
                      <option value="Networking">Networking</option>
                      <option value="Workstations">Workstations</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Other">Other</option>
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

                <DeviceParameters
                  index={index}
                  deviceClass={device.device_class}
                  onValuesComputed={handleDeviceComputed}
                />

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Effective Power (W)</label>
                    <div className="px-3 py-2 bg-muted/50 border border-border rounded text-sm h-10 flex items-center">
                      {device.power_rating_watts} W
                    </div>
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
            {loading ? "Saving..." : isRoutine ? "Save Routine" : "Save Audit"}
          </Button>
        </form>
      </CardContent>
    </Card >
  )
}
