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
  discountRate?: number // Default 5% for NPV calculations
  inflationRate?: number // Default 3% for energy cost increases
  salvageValuePercent?: number // Default 10% of purchase cost
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

  // Calculate lifetime kWh with year-by-year degradation
  let lifetimeKwh = 0
  if (includeUncertainty) {
    for (let year = 0; year < device.lifespan; year++) {
      const currentAge = device.age + year
      // Apply degradation year by year, capped at 50% reduction
      const yearDegradation = 1 - Math.min((degradationRate / 100) * currentAge, 0.5)
      lifetimeKwh += annualKwh * yearDegradation
    }
  } else {
    lifetimeKwh = annualKwh * device.lifespan
  }

  return {
    annualKwh: Math.round(annualKwh * 100) / 100,
    lifetimeKwh: Math.round(lifetimeKwh * 100) / 100,
    idleKwh: Math.round(dailyIdleKwh * 365 * 100) / 100,
    normalKwh: Math.round(dailyNormalKwh * 365 * 100) / 100,
    peakKwh: Math.round(dailyPeakKwh * 365 * 100) / 100,
  }
}

function calculateTCO(
  device: Device,
  annualKwh: number,
  tariff: number,
  degradationRate: number,
  includeUncertainty: boolean,
  discountRate: number = 0.05,
  inflationRate: number = 0.03,
  salvageValuePercent: number = 0.1
): number {
  // Initial purchase cost at year 0
  let npv = device.purchaseCost

  // Calculate year-by-year costs with NPV, degradation, and inflation
  for (let year = 1; year <= device.lifespan; year++) {
    const currentAge = device.age + year - 1
    
    // Apply degradation to energy consumption
    let yearKwh = annualKwh
    if (includeUncertainty) {
      const yearDegradation = 1 - Math.min((degradationRate / 100) * currentAge, 0.5)
      yearKwh = annualKwh * yearDegradation
    }
    
    // Apply inflation to tariff
    const inflatedTariff = tariff * Math.pow(1 + inflationRate, year)
    
    // Calculate year costs
    const yearEnergyCost = yearKwh * inflatedTariff
    const yearMaintenanceCost = device.maintenanceCost
    const yearTotalCost = yearEnergyCost + yearMaintenanceCost
    
    // Discount to present value
    const discountedCost = yearTotalCost / Math.pow(1 + discountRate, year)
    npv += discountedCost
  }

  // Subtract salvage value at end of life (discounted)
  const salvageValue = device.purchaseCost * salvageValuePercent
  const discountedSalvage = salvageValue / Math.pow(1 + discountRate, device.lifespan)
  npv -= discountedSalvage

  return Math.round(npv * 100) / 100
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

    const { 
      deviceA, 
      deviceB, 
      tariff, 
      carbonFactor, 
      degradationRate, 
      includeUncertainty,
      discountRate = 0.05, // Default 5%
      inflationRate = 0.03, // Default 3%
      salvageValuePercent = 0.1 // Default 10%
    } = body

    // Validate inputs
    if (!deviceA || !deviceB || tariff <= 0 || carbonFactor <= 0) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
    }

    // Calculate energy consumption
    const energyA = calculateEnergyConsumption(deviceA, includeUncertainty, degradationRate)
    const energyB = calculateEnergyConsumption(deviceB, includeUncertainty, degradationRate)

    // Calculate TCO with NPV
    const TCOA = calculateTCO(
      deviceA, 
      energyA.annualKwh, 
      tariff, 
      degradationRate, 
      includeUncertainty,
      discountRate,
      inflationRate,
      salvageValuePercent
    )
    const TCOB = calculateTCO(
      deviceB, 
      energyB.annualKwh, 
      tariff, 
      degradationRate, 
      includeUncertainty,
      discountRate,
      inflationRate,
      salvageValuePercent
    )

    // Calculate break-even (fixed to include maintenance)
    const capitalCostDifference = Math.abs(deviceB.purchaseCost - deviceA.purchaseCost)
    const annualEnergySavings = (energyA.annualKwh - energyB.annualKwh) * tariff
    const annualMaintenanceSavings = deviceA.maintenanceCost - deviceB.maintenanceCost
    const totalAnnualSavings = annualEnergySavings + annualMaintenanceSavings
    const breakEvenMonths =
      totalAnnualSavings > 0 ? Math.round((capitalCostDifference / totalAnnualSavings) * 12 * 100) / 100 : -1

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
        costPerYear: Math.round(totalAnnualSavings * 100) / 100,
        carbonPerYear: Math.round((carbonA - carbonB) * 100) / 100,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Simulation calculation error:", error)
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
  }
}
