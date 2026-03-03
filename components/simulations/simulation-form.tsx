"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, HelpCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeviceFormData {
  name: string
  deviceType: string
  powerRating: number
  idlePower: number
  normalPower: number
  peakPower: number
  age: number
  purchaseCost: number
  lifespan: number
  maintenanceCost: number
  usage: {
    idleHours: number
    normalHours: number
    peakHours: number
  }
  units: number
}

const DEVICE_TYPES = ["Workstation", "Monitor", "Server", "Switch", "UPS", "Custom"]
const USAGE_PROFILES = ["Typical Lab Device", "Typical Server", "Always-On Network Switch", "Custom"]

interface SimulationFormProps {
  onRun: (data: { deviceA: DeviceFormData; deviceB: DeviceFormData }) => void
  isLoading: boolean
  presets: Record<string, { idleHours: number; normalHours: number; peakHours: number }>
}

const DEFAULT_DEVICE: DeviceFormData = {
  name: "Device",
  deviceType: "Workstation",
  powerRating: 300,
  idlePower: 50,
  normalPower: 150,
  peakPower: 300,
  age: 0,
  purchaseCost: 50000,
  lifespan: 5,
  maintenanceCost: 2000,
  usage: {
    idleHours: 2,
    normalHours: 6,
    peakHours: 0,
  },
  units: 1,
}

export default function SimulationForm({ onRun, isLoading, presets }: SimulationFormProps) {
  const [deviceA, setDeviceA] = useState<DeviceFormData>(DEFAULT_DEVICE)
  const [deviceB, setDeviceB] = useState<DeviceFormData>({
    ...DEFAULT_DEVICE,
    name: "Proposed Device",
    idlePower: 30,
    normalPower: 100,
    peakPower: 200,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (deviceA.name.trim() === "") newErrors.deviceAName = "Device name required"
    if (deviceB.name.trim() === "") newErrors.deviceBName = "Device name required"

    const totalHoursA = deviceA.usage.idleHours + deviceA.usage.normalHours + deviceA.usage.peakHours
    const totalHoursB = deviceB.usage.idleHours + deviceB.usage.normalHours + deviceB.usage.peakHours

    if (totalHoursA > 24) newErrors.usageA = "Total hours must be ≤ 24"
    if (totalHoursB > 24) newErrors.usageB = "Total hours must be ≤ 24"

    if (deviceA.purchaseCost < 0) newErrors.costA = "Purchase cost must be non-negative"
    if (deviceB.purchaseCost < 0) newErrors.costB = "Purchase cost must be non-negative"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRun = () => {
    if (validateForm()) {
      onRun({ deviceA, deviceB })
    }
  }

  const updateDeviceA = (updates: Partial<DeviceFormData>) => {
    setDeviceA({ ...deviceA, ...updates })
  }

  const updateDeviceB = (updates: Partial<DeviceFormData>) => {
    setDeviceB({ ...deviceB, ...updates })
  }

  const updateUsageA = (updates: Partial<DeviceFormData["usage"]>) => {
    setDeviceA({ ...deviceA, usage: { ...deviceA.usage, ...updates } })
  }

  const updateUsageB = (updates: Partial<DeviceFormData["usage"]>) => {
    setDeviceB({ ...deviceB, usage: { ...deviceB.usage, ...updates } })
  }

  const applyPresetA = (preset: string) => {
    updateUsageA(presets[preset])
  }

  const applyPresetB = (preset: string) => {
    updateUsageB(presets[preset])
  }

  const DeviceFormSection = ({
    device,
    onUpdate,
    onUsageUpdate,
    onPresetApply,
    label,
    errorKey,
  }: {
    device: DeviceFormData
    onUpdate: (updates: Partial<DeviceFormData>) => void
    onUsageUpdate: (updates: Partial<DeviceFormData["usage"]>) => void
    onPresetApply: (preset: string) => void
    label: string
    errorKey: string
  }) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">{label}</h4>

      {/* Device Name and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Device Name</label>
          <Input
            value={device.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Lab Workstation A"
          />
          {errors[`${errorKey}Name`] && <p className="text-xs text-destructive mt-1">{errors[`${errorKey}Name`]}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-2">
            Device Type
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Device Types</AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-muted-foreground">
                  Select the category that best describes your device. This helps categorize results.
                </p>
              </AlertDialogContent>
            </AlertDialog>
          </label>
          <Select value={device.deviceType} onValueChange={(v) => onUpdate({ deviceType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Power Ratings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-1">
            Power Rating (W)
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="w-3 h-3" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Power Rating</AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-muted-foreground">
                  Maximum power the device can draw, typically found on device specs.
                </p>
              </AlertDialogContent>
            </AlertDialog>
          </label>
          <Input
            type="number"
            value={device.powerRating}
            onChange={(e) => onUpdate({ powerRating: Number(e.target.value) })}
            placeholder="300"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Idle Power (W)</label>
          <Input
            type="number"
            value={device.idlePower}
            onChange={(e) => onUpdate({ idlePower: Number(e.target.value) })}
            placeholder="50"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Normal Power (W)</label>
          <Input
            type="number"
            value={device.normalPower}
            onChange={(e) => onUpdate({ normalPower: Number(e.target.value) })}
            placeholder="150"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Peak Power (W)</label>
          <Input
            type="number"
            value={device.peakPower}
            onChange={(e) => onUpdate({ peakPower: Number(e.target.value) })}
            placeholder="300"
            min="0"
          />
        </div>
      </div>

      {/* Age and Lifespan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Age (years)</label>
          <Input
            type="number"
            value={device.age}
            onChange={(e) => onUpdate({ age: Number(e.target.value) })}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Lifespan (years)</label>
          <Input
            type="number"
            value={device.lifespan}
            onChange={(e) => onUpdate({ lifespan: Number(e.target.value) })}
            placeholder="5"
            min="1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Units</label>
          <Input
            type="number"
            value={device.units}
            onChange={(e) => onUpdate({ units: Number(e.target.value) })}
            placeholder="1"
            min="1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Maintenance/Year (KSh)</label>
          <Input
            type="number"
            value={device.maintenanceCost}
            onChange={(e) => onUpdate({ maintenanceCost: Number(e.target.value) })}
            placeholder="2000"
            min="0"
          />
        </div>
      </div>

      {/* Purchase Cost */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Purchase Cost (KSh)</label>
        <Input
          type="number"
          value={device.purchaseCost}
          onChange={(e) => onUpdate({ purchaseCost: Number(e.target.value) })}
          placeholder="50000"
          min="0"
        />
        {errors[`${errorKey}Cost`] && <p className="text-xs text-destructive mt-1">{errors[`${errorKey}Cost`]}</p>}
      </div>

      {/* Usage Schedule */}
      <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
        <label className="font-medium text-foreground block">Usage Schedule</label>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Preset Profile</label>
          <Select onValueChange={onPresetApply} defaultValue="">
            <SelectTrigger>
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              {USAGE_PROFILES.map((profile) => (
                <SelectItem key={profile} value={profile}>
                  {profile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Idle Hours/Day</label>
            <Input
              type="number"
              value={device.usage.idleHours}
              onChange={(e) => onUsageUpdate({ idleHours: Number(e.target.value) })}
              placeholder="2"
              min="0"
              max="24"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Normal Hours/Day</label>
            <Input
              type="number"
              value={device.usage.normalHours}
              onChange={(e) => onUsageUpdate({ normalHours: Number(e.target.value) })}
              placeholder="6"
              min="0"
              max="24"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Peak Hours/Day</label>
            <Input
              type="number"
              value={device.usage.peakHours}
              onChange={(e) => onUsageUpdate({ peakHours: Number(e.target.value) })}
              placeholder="0"
              min="0"
              max="24"
            />
          </div>
        </div>

        {errors[`${errorKey}Usage`] && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{errors[`${errorKey}Usage`]}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Total: {device.usage.idleHours + device.usage.normalHours + device.usage.peakHours}/24 hours
        </p>
      </div>
    </div>
  )

  return (
    <Card className="mb-8 p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Device Comparison Form</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DeviceFormSection
          device={deviceA}
          onUpdate={updateDeviceA}
          onUsageUpdate={updateUsageA}
          onPresetApply={applyPresetA}
          label="Existing Device"
          errorKey="deviceA"
        />

        <DeviceFormSection
          device={deviceB}
          onUpdate={updateDeviceB}
          onUsageUpdate={updateUsageB}
          onPresetApply={applyPresetB}
          label="Proposed Device"
          errorKey="deviceB"
        />
      </div>

      <Button onClick={handleRun} disabled={isLoading} className="w-full mt-8" size="lg">
        {isLoading ? "Running Simulation..." : "Run Simulation"}
      </Button>
    </Card>
  )
}
