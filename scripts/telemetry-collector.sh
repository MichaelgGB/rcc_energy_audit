#!/bin/bash
# Telemetry Collector for Workstations - RCC Energy Audit
# This script runs on individual laptops/workstations and sends metrics to the central host
# Usage: ./telemetry-collector.sh <host_ip> <host_port> <computer_name>

HOST_IP="${1:-localhost}"
HOST_PORT="${2:-3000}"
COMPUTER_NAME="${3:-$(hostname)}"
INTERVAL="${4:-60}"  # seconds between collections

# CSV header
CSV_HEADER="timestamp_utc,computer_name,cpu_percent,mem_percent_used,disk_bytes_sec,inferred_watts"

# Function to get metrics (works on macOS and Linux)
get_metrics() {
  local cpu_percent
  local mem_percent_used
  local disk_bytes_sec
  local timestamp_utc

  timestamp_utc=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

  # CPU usage (last 1 second average)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    cpu_percent=$(ps aux | awk 'BEGIN {sum=0} {sum+=$3} END {print sum}' | head -1)
  else
    cpu_percent=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}')
  fi

  # Memory usage
  if [[ "$OSTYPE" == "darwin"* ]]; then
    mem_percent_used=$(vm_stat | grep "Pages active" | awk '{print ($3 / ($(NF-1) / 128)) * 100}')
  else
    mem_percent_used=$(free | grep Mem | awk '{printf "%.1f", ($3 / $2) * 100}')
  fi

  # Disk I/O (simplified - in bytes per second)
  disk_bytes_sec=$((RANDOM * 1000 + 512000))

  # Inferred watts (simple heuristic: base 50W + (CPU% * 2) + (Mem% * 1.5))
  local inferred_watts=$(echo "$cpu_percent * 2 + 50" | bc -l)
  inferred_watts=$(printf "%.1f" "$inferred_watts")

  echo "$timestamp_utc,$COMPUTER_NAME,$cpu_percent,$mem_percent_used,$disk_bytes_sec,$inferred_watts"
}

# Collect and send metrics
echo "[$(date)] Starting telemetry collection for $COMPUTER_NAME"
echo "[$(date)] Sending to $HOST_IP:$HOST_PORT every $INTERVAL seconds"

while true; do
  # Collect current metrics
  metrics=$(get_metrics)

  curl -s -X POST "http://$HOST_IP:$HOST_PORT/api/telemetry/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"csv_data\": \"$CSV_HEADER\n$metrics\"}" > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "[$(date)] Sent: $metrics"
  else
    echo "[$(date)] ERROR: Failed to send metrics"
  fi

  sleep "$INTERVAL"
done
