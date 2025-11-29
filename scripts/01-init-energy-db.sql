-- Energy Database (Manual Audits)
CREATE TABLE IF NOT EXISTS audits (
  audit_id SERIAL PRIMARY KEY,
  audit_name VARCHAR(255) NOT NULL,
  audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  device_id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  device_class VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  power_rating_watts DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  hours_per_day DECIMAL(5, 2) NOT NULL DEFAULT 8,
  daily_kwh_total DECIMAL(10, 4) GENERATED ALWAYS AS (
    power_rating_watts * quantity * hours_per_day / 1000
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_audit_id ON devices(audit_id);
CREATE INDEX idx_audits_date ON audits(audit_date);
