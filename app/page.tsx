"use client"
import Link from "next/link"
import { ArrowRight, Zap, BarChart3, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Energy Audit</h1>
          </div>
          {/* Navigation is now handled by sidebar */}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-balance">Sustainable Computing Energy Audit Platform</h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto text-balance">
            Transform raw energy data into actionable insights. Monitor, analyze, and optimize your campus computing
            infrastructure for maximum sustainability.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/audit">
              <Button size="lg" className="gap-2">
                Start Audit <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-card border border-border rounded-lg p-6">
            <BarChart3 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Manual Audits</h3>
            <p className="text-muted">
              Perform detailed energy audits by entering device specifications for different labs and locations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Activity className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-Time Monitoring</h3>
            <p className="text-muted">
              Ingest and process continuous telemetry data from workstations to identify dynamic energy usage patterns.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Zap className="w-12 h-12 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
            <p className="text-muted">
              Discover idle waste, peak consumption, and optimization opportunities with data-driven analysis.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
