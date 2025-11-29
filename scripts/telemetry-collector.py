#!/usr/bin/env python3
"""
Telemetry Collector for Windows/Linux/macOS Workstations - RCC Energy Audit
Continuously monitors system metrics and sends to central host

Usage: python3 telemetry-collector.py --host localhost --port 3000 --interval 60
"""

import psutil
import requests
import json
import argparse
import time
from datetime import datetime
import socket
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

class TelemetryCollector:
    def __init__(self, host, port, computer_name=None, interval=60):
        self.host = host
        self.port = port
        self.computer_name = computer_name or socket.gethostname()
        self.interval = interval
        self.base_url = f"http://{host}:{port}"
        self.csv_header = "timestamp_utc,computer_name,cpu_percent,mem_percent_used,disk_bytes_sec,inferred_watts"

    def get_metrics(self):
        """Collect system metrics"""
        try:
            # CPU usage (percentage)
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage (percentage)
            mem = psutil.virtual_memory()
            mem_percent_used = mem.percent
            
            # Disk I/O (bytes per second - approximate)
            try:
                disk_io = psutil.disk_io_counters()
                disk_bytes_sec = disk_io.write_bytes + disk_io.read_bytes
            except:
                disk_bytes_sec = 0
            
            # Inferred watts (simple heuristic)
            # Base power draw 50W + CPU contribution + Memory contribution
            inferred_watts = 50 + (cpu_percent * 2) + (mem_percent_used * 0.5)
            
            # Timestamp in UTC ISO format
            timestamp_utc = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            
            return {
                'timestamp_utc': timestamp_utc,
                'computer_name': self.computer_name,
                'cpu_percent': round(cpu_percent, 2),
                'mem_percent_used': round(mem_percent_used, 2),
                'disk_bytes_sec': disk_bytes_sec,
                'inferred_watts': round(inferred_watts, 2)
            }
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            return None

    def format_csv(self, metrics):
        """Format metrics as CSV"""
        if not metrics:
            return None
        return f"{metrics['timestamp_utc']},{metrics['computer_name']},{metrics['cpu_percent']},{metrics['mem_percent_used']},{metrics['disk_bytes_sec']},{metrics['inferred_watts']}"

    def send_metrics(self, csv_data):
        """Send metrics to central host"""
        try:
            payload = {
                'csv_data': f"{self.csv_header}\n{csv_data}"
            }
            response = requests.post(
                f"{self.base_url}/api/telemetry/ingest",
                json=payload,
                timeout=10
            )
            if response.status_code == 200:
                logger.info(f"Sent: {csv_data}")
                return True
            else:
                logger.error(f"Server returned {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            logger.error(f"Failed to connect to {self.base_url}")
            return False
        except Exception as e:
            logger.error(f"Error sending metrics: {e}")
            return False

    def run(self):
        """Main collection loop"""
        logger.info(f"Starting telemetry collection for {self.computer_name}")
        logger.info(f"Sending to {self.base_url} every {self.interval} seconds")
        
        try:
            while True:
                metrics = self.get_metrics()
                if metrics:
                    csv_data = self.format_csv(metrics)
                    self.send_metrics(csv_data)
                time.sleep(self.interval)
        except KeyboardInterrupt:
            logger.info("Telemetry collection stopped")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Telemetry Collector for RCC Energy Audit')
    parser.add_argument('--host', default='localhost', help='Host IP address')
    parser.add_argument('--port', type=int, default=3000, help='Host port')
    parser.add_argument('--interval', type=int, default=60, help='Interval between collections (seconds)')
    parser.add_argument('--name', help='Computer name (default: hostname)')
    
    args = parser.parse_args()
    
    collector = TelemetryCollector(
        host=args.host,
        port=args.port,
        computer_name=args.name,
        interval=args.interval
    )
    collector.run()
