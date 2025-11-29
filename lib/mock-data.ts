// This ensures data persists across API calls instead of each endpoint having separate arrays

export const mockAuditStore = {
  audits: [
    {
      audit_id: 1,
      audit_name: "Lighting Audit Lab A",
      location: "Building A",
      audit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      devices: [
        {
          device_class: "Lighting",
          description: "LED Panels",
          power_rating_watts: 500,
          quantity: 10,
          hours_per_day: 10,
          daily_kwh_total: 50,
        },
        {
          device_class: "Servers",
          description: "Storage Server",
          power_rating_watts: 2000,
          quantity: 2,
          hours_per_day: 24,
          daily_kwh_total: 96,
        },
      ],
    },
  ],
  nextAuditId: 2,
}
