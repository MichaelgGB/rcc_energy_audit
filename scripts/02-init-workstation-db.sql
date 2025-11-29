-- Workstation Monitoring Database (Automated Telemetry)
CREATE TABLE IF NOT EXISTS queue_table (
  id SERIAL PRIMARY KEY,
  raw_csv_data TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS metrics_repository (
  id SERIAL PRIMARY KEY,
  timestamp_utc TIMESTAMP NOT NULL,
  computer_name VARCHAR(255) NOT NULL,
  cpu_percent DECIMAL(5, 2),
  mem_percent_used DECIMAL(5, 2),
  disk_bytes_sec BIGINT,
  inferred_watts DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_timestamp ON metrics_repository(timestamp_utc);
CREATE INDEX idx_metrics_computer ON metrics_repository(computer_name);
CREATE INDEX idx_metrics_composite ON metrics_repository(computer_name, timestamp_utc);
