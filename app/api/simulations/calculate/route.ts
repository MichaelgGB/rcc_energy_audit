import { NextResponse } from "next/server"

interface Device {
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

interface SimulationInput {
  deviceA: Device
  deviceB: Device
  tariff: number
  carbonFactor: number
  degradationRate: number
  includeUncertainty: boolean
}

interface EnergyData {
  annualKwh: number
  lifetimeKwh: number
  idleKwh: number
  normalKwh: number
  peakKwh: number
}

interface SimulationOutput {
  energyA: EnergyData
  energyB: EnergyData
  TCOA: number
  TCOB: number
  breakEvenMonths: number
  carbonA: number
  carbonB: number
  uncertaintyScore: number
  savings: {
    energyPerYear: number
    costPerYear: number
    carbonPerYear: number
  }
}

function calculateEnergyConsumption(device: Device, includeUncertainty: boolean, degradationRate: number): EnergyData {
  const { idleHours, normalHours, peakHours } = device.usage
  const units = device.units || 1

  const dailyIdleKwh = (device.idlePower * idleHours * units) / 1000
  const dailyNormalKwh = (device.normalPower * normalHours * units) / 1000
  const dailyPeakKwh = (device.peakPower * peakHours * units) / 1000

  const annualKwh = (dailyIdleKwh + dailyNormalKwh + dailyPeakKwh) * 365

  let lifetimeKwh = annualKwh * device.lifespan

  if (includeUncertainty && device.age > 0) {
    const degradationFactor = 1 - (degradationRate / 100) * device.age
    lifetimeKwh *= degradationFactor
  }

  return {
    annualKwh: Math.round(annualKwh * 100) / 100,
    lifetimeKwh: Math.round(lifetimeKwh * 100) / 100,
    idleKwh: Math.round(dailyIdleKwh * 365 * 100) / 100,
    normalKwh: Math.round(dailyNormalKwh * 365 * 100) / 100,
    peakKwh: Math.round(dailyPeakKwh * 365 * 100) / 100,
  }
}

function calculateTCO(device: Device, annualKwh: number, tariff: number): number {
  const energyCost = annualKwh * device.lifespan * tariff
  const maintenanceCostTotal = device.maintenanceCost * device.lifespan
  const tco = device.purchaseCost + energyCost + maintenanceCostTotal
  return Math.round(tco * 100) / 100
}

function calculateUncertaintyScore(deviceA: Device, deviceB: Device, includeUncertainty: boolean): number {
  if (!includeUncertainty) return 100

  let penalties = 0

  // Age penalty
  penalties += Math.min(deviceA.age * 5 + deviceB.age * 5, 20)

  // Missing usage data penalty
  const aUsageGap = deviceA.usage.idleHours + deviceA.usage.normalHours + deviceA.usage.peakHours
  const bUsageGap = deviceB.usage.idleHours + deviceB.usage.normalHours + deviceB.usage.peakHours

  if (aUsageGap === 0 || bUsageGap === 0) penalties += 15
  if (aUsageGap > 24 || bUsageGap > 24) penalties += 10

  return Math.max(0, 100 - penalties)
}

export async function POST(req: Request) {
  try {
    const body: SimulationInput = await req.json()

    const { deviceA, deviceB, tariff, carbonFactor, degradationRate, includeUncertainty } = body

    // Validate inputs
    if (!deviceA || !deviceB || tariff <= 0 || carbonFactor <= 0) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
    }

    // Calculate energy consumption
    const energyA = calculateEnergyConsumption(deviceA, includeUncertainty, degradationRate)
    const energyB = calculateEnergyConsumption(deviceB, includeUncertainty, degradationRate)

    // Calculate TCO
    const TCOA = calculateTCO(deviceA, energyA.annualKwh, tariff)
    const TCOB = calculateTCO(deviceB, energyB.annualKwh, tariff)

    // Calculate break-even
    const capitalCostDifference = Math.abs(deviceB.purchaseCost - deviceA.purchaseCost)
    const annualSavings = (energyA.annualKwh - energyB.annualKwh) * tariff
    const breakEvenMonths =
      annualSavings > 0 ? Math.round((capitalCostDifference / annualSavings) * 12 * 100) / 100 : -1

    // Calculate carbon footprint
    const carbonA = Math.round(energyA.annualKwh * carbonFactor * 100) / 100
    const carbonB = Math.round(energyB.annualKwh * carbonFactor * 100) / 100

    // Calculate uncertainty
    const uncertaintyScore = calculateUncertaintyScore(deviceA, deviceB, includeUncertainty)

    const result: SimulationOutput = {
      energyA,
      energyB,
      TCOA,
      TCOB,
      breakEvenMonths,
      carbonA,
      carbonB,
      uncertaintyScore,
      savings: {
        energyPerYear: Math.round((energyA.annualKwh - energyB.annualKwh) * 100) / 100,
        costPerYear: Math.round((annualSavings - (deviceB.maintenanceCost - deviceA.maintenanceCost)) * 100) / 100,
        carbonPerYear: Math.round((carbonA - carbonB) * 100) / 100,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Simulation calculation error:", error)
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
  }
}
