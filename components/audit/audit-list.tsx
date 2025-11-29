"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Audit {
  audit_id: number
  audit_name: string
  location: string
  audit_date: string
  devices?: any[]
}

export default function AuditList() {
  const {
    data: audits,
    isLoading,
    mutate,
  } = useSWR("/api/audits/list", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 2000, // Added auto-refresh every 2 seconds to catch new audits
  })
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (isLoading) return <div className="text-center py-8">Loading audits...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Saved Audits</h2>
      {!audits || audits.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-8">
            <p className="text-center text-muted">No audits yet. Create one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {audits.map((audit: Audit) => (
            <Card key={audit.audit_id} className="bg-card border-border cursor-pointer hover:bg-opacity-80 transition">
              <CardHeader
                onClick={() => setExpandedId(expandedId === audit.audit_id ? null : audit.audit_id)}
                className="pb-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{audit.audit_name}</CardTitle>
                    <CardDescription>
                      {audit.location} • {new Date(audit.audit_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedId === audit.audit_id ? "rotate-180" : ""}`}
                  />
                </div>
              </CardHeader>

              {expandedId === audit.audit_id && audit.devices && (
                <CardContent className="pt-0">
                  <div className="space-y-2 border-t border-border pt-4">
                    {audit.devices.map((device: any, idx: number) => (
                      <div key={idx} className="text-sm grid grid-cols-2 gap-2">
                        <span className="text-muted">
                          {device.device_class}: {device.description}
                        </span>
                        <span className="font-medium">{device.daily_kwh_total?.toFixed(2)} kWh/day</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
