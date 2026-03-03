"use client"

import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

export interface DeviceParams {
    idleWatts?: number
    activeWatts?: number
    peakWatts?: number
    idleHours?: number
    activeHours?: number
    peakHours?: number
    serverEfficiency?: number // e.g. 0.85 for 85%
    serverLoad?: number // 0-100%
    switchPorts?: number
    switchActivePorts?: number
    poePorts?: number
    upsEfficiency?: number // e.g. 0.90
    upsLoadW?: number
    lightTech?: string // LED vs Fluorescent
    hvacBtu?: number
}

interface DeviceParametersProps {
    index: number
    deviceClass: string
    onValuesComputed: (index: number, effectiveWatts: number, effectiveHours: number, params: DeviceParams) => void
}

export function DeviceParameters({ index, deviceClass, onValuesComputed }: DeviceParametersProps) {
    // Common state
    const [params, setParams] = useState<DeviceParams>({})

    // Default simple power/hours backward compatibility mode
    const [simplePower, setSimplePower] = useState<number>(0)
    const [simpleHours, setSimpleHours] = useState<number>(8)

    // Workstation specific state (default 8 hours: 6 active, 2 idle)
    const [ws, setWs] = useState({
        idleW: 30, activeW: 100, peakW: 250,
        idleH: 2, activeH: 5, peakH: 1
    })

    // Infrastructure specific state
    const [infraType, setInfraType] = useState<"Server" | "Switch" | "UPS">("Server")
    const [server, setServer] = useState({ efficiency: 0.90, avgLoad: 40, maxPower: 400, hours: 24 })
    const [network, setNetwork] = useState({ basePower: 50, activePorts: 24, poePorts: 0, hours: 24 })
    const [ups, setUps] = useState({ efficiency: 0.95, loadW: 1000, hours: 24 })

    // Facilities specific state
    const [facType, setFacType] = useState<"Lighting" | "HVAC">("Lighting")
    const [light, setLight] = useState({ tech: "LED", watts: 40, hours: 12 })
    // 1 BTU/hr = 0.293 W. An AC with 10,000 BTU rating might use ~1000W of electrical power.
    // SEER (Seasonal Energy Efficiency Ratio) = BTU / Watt-hours
    const [hvac, setHvac] = useState({ btu: 12000, seer: 14, hours: 8 })

    useEffect(() => {
        let effectiveWatts = 0
        let effectiveHours = 0
        let currentParams: DeviceParams = {}

        if (deviceClass === "Workstations") {
            const totalH = ws.idleH + ws.activeH + ws.peakH
            effectiveHours = totalH > 0 ? totalH : 8

            if (totalH > 0) {
                effectiveWatts = ((ws.idleW * ws.idleH) + (ws.activeW * ws.activeH) + (ws.peakW * ws.peakH)) / totalH
            } else {
                effectiveWatts = ws.activeW
            }

            currentParams = {
                idleWatts: ws.idleW,
                activeWatts: ws.activeW,
                peakWatts: ws.peakW,
                idleHours: ws.idleH,
                activeHours: ws.activeH,
                peakHours: ws.peakH
            }
        } else if (deviceClass === "Servers" || deviceClass === "Networking") {
            // Repurpose Infrastructure under Servers / Networking classes to match standard classes
            if (deviceClass === "Servers" || infraType === "Server") {
                // Simple linear interpolation
                const idlePwr = server.maxPower * 0.3
                effectiveWatts = idlePwr + (server.maxPower - idlePwr) * (server.avgLoad / 100)
                // Add inefficiency
                effectiveWatts = effectiveWatts / server.efficiency
                effectiveHours = server.hours
                currentParams = { serverEfficiency: server.efficiency, serverLoad: server.avgLoad }
            } else if (deviceClass === "Networking" || infraType === "Switch") {
                // ~2W per active port, ~15W per PoE port
                effectiveWatts = network.basePower + (network.activePorts * 2) + (network.poePorts * 15)
                effectiveHours = network.hours
                currentParams = { switchPorts: network.activePorts + network.poePorts, switchActivePorts: network.activePorts, poePorts: network.poePorts }
            }
        } else if (deviceClass === "Lighting") {
            effectiveWatts = light.watts
            effectiveHours = light.hours
            currentParams = { lightTech: light.tech }
        } else if (deviceClass === "HVAC") {
            // Power = BTU / SEER
            effectiveWatts = hvac.btu / hvac.seer
            effectiveHours = hvac.hours
            currentParams = { hvacBtu: hvac.btu }
        } else {
            // Other generic devices
            effectiveWatts = simplePower
            effectiveHours = simpleHours
        }

        onValuesComputed(index, Math.round(effectiveWatts), effectiveHours, currentParams)
    }, [deviceClass, ws, infraType, server, network, ups, facType, light, hvac, simplePower, simpleHours, index, onValuesComputed])


    if (deviceClass === "Workstations") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
                <div className="col-span-full">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Workstation Load Profile</h4>
                </div>
                <div>
                    <label className="block text-xs mb-1">Idle Power (W)</label>
                    <Input type="number" value={ws.idleW} onChange={e => setWs({ ...ws, idleW: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Normal Load (W)</label>
                    <Input type="number" value={ws.activeW} onChange={e => setWs({ ...ws, activeW: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Peak Load (W)</label>
                    <Input type="number" value={ws.peakW} onChange={e => setWs({ ...ws, peakW: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Idle Hours</label>
                    <Input type="number" value={ws.idleH} onChange={e => setWs({ ...ws, idleH: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Normal Load Hours</label>
                    <Input type="number" value={ws.activeH} onChange={e => setWs({ ...ws, activeH: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Peak Load Hours</label>
                    <Input type="number" value={ws.peakH} onChange={e => setWs({ ...ws, peakH: Number(e.target.value) })} className="h-8" />
                </div>
            </div>
        )
    }

    if (deviceClass === "Servers") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
                <div className="col-span-full">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Server Specifications</h4>
                </div>
                <div>
                    <label className="block text-xs mb-1">Max Power Rating (W)</label>
                    <Input type="number" value={server.maxPower} onChange={e => setServer({ ...server, maxPower: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Average Load (%)</label>
                    <Input type="number" value={server.avgLoad} onChange={e => setServer({ ...server, avgLoad: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">PSU Efficiency (0.0 - 1.0)</label>
                    <Input type="number" step="0.01" value={server.efficiency} onChange={e => setServer({ ...server, efficiency: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Hours/Day</label>
                    <Input type="number" value={server.hours} onChange={e => setServer({ ...server, hours: Number(e.target.value) })} className="h-8" />
                </div>
            </div>
        )
    }

    if (deviceClass === "Networking") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
                <div className="col-span-full">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Switch / Network Specs</h4>
                </div>
                <div>
                    <label className="block text-xs mb-1">Base Power (W)</label>
                    <Input type="number" value={network.basePower} onChange={e => setNetwork({ ...network, basePower: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Active Ports</label>
                    <Input type="number" value={network.activePorts} onChange={e => setNetwork({ ...network, activePorts: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">PoE Ports Active</label>
                    <Input type="number" value={network.poePorts} onChange={e => setNetwork({ ...network, poePorts: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Hours/Day</label>
                    <Input type="number" value={network.hours} onChange={e => setNetwork({ ...network, hours: Number(e.target.value) })} className="h-8" />
                </div>
            </div>
        )
    }

    if (deviceClass === "Lighting") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
                <div className="col-span-full">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Lighting Parameters</h4>
                </div>
                <div>
                    <label className="block text-xs mb-1">Technology Type</label>
                    <select
                        className="w-full px-3 py-1 bg-background border border-border rounded text-sm h-8"
                        value={light.tech}
                        onChange={e => setLight({ ...light, tech: e.target.value })}
                    >
                        <option>LED</option>
                        <option>Fluorescent</option>
                        <option>Incandescent</option>
                        <option>Halogen</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">Power per Unit (W)</label>
                    <Input type="number" value={light.watts} onChange={e => setLight({ ...light, watts: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Hours/Day</label>
                    <Input type="number" value={light.hours} onChange={e => setLight({ ...light, hours: Number(e.target.value) })} className="h-8" />
                </div>
            </div>
        )
    }

    if (deviceClass === "HVAC") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
                <div className="col-span-full">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Cooling Parameters</h4>
                </div>
                <div>
                    <label className="block text-xs mb-1">Cooling Capacity (BTU)</label>
                    <Input type="number" value={hvac.btu} onChange={e => setHvac({ ...hvac, btu: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Efficiency (SEER Rating)</label>
                    <Input type="number" value={hvac.seer} onChange={e => setHvac({ ...hvac, seer: Number(e.target.value) })} className="h-8" />
                </div>
                <div>
                    <label className="block text-xs mb-1">Hours/Day Actively Cooling</label>
                    <Input type="number" value={hvac.hours} onChange={e => setHvac({ ...hvac, hours: Number(e.target.value) })} className="h-8" />
                </div>
            </div>
        )
    }

    // Fallback for "Other" generic devices fallback
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4 p-4 border rounded bg-muted/20">
            <div>
                <label className="block text-xs mb-1">Power Rating (W)</label>
                <Input type="number" value={simplePower} onChange={e => setSimplePower(Number(e.target.value))} className="h-8" required />
            </div>
            <div>
                <label className="block text-xs mb-1">Hours/Day</label>
                <Input type="number" step="0.5" value={simpleHours} onChange={e => setSimpleHours(Number(e.target.value))} className="h-8" />
            </div>
        </div>
    )
}
