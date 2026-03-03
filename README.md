  # Sustainable Computing Energy Audit Platform

A sophisticated full-stack application for monitoring and analyzing energy consumption in campus computing infrastructure. Combines manual audit data with real-time telemetry to identify optimization opportunities and reduce carbon footprint.

## Project Overview

This platform operates in two distinct modes:

### 1. **Manual Audit System**
- Perform periodic, high-level energy audits by entering device specifications
- Track devices across different labs and locations
- Automatic calculation of daily kWh consumption
- Historical audit tracking and comparison

### 2. **Automated Telemetry System**
- Continuous real-time performance monitoring from workstations
- Collect CPU %, Memory %, Disk I/O, and inferred wattage
- Fast ingestion pipeline for CSV data
- Time-series analysis to identify idle waste and peak consumption patterns

## Technology Stack

### Backend
- **Runtime**: Node.js 
- **Language**: TypeScript
- **API Framework**: Next.js Route Handlers (API Routes)
- **Database Driver**: PostgreSQL (`pg` library)

### Frontend
- **Framework**: Next.js with React 19
- **Language**: TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts for data visualization
- **State Management**: SWR for client-side data fetching

### Database
- **Manual Audits DB**: PostgreSQL (`energy_db`)
  - `audits` table: Audit metadata (name, location, date)
  - `devices` table: Device specifications with calculated daily kWh

- **Telemetry DB**: PostgreSQL (`workstation_monitor`)
  - `metrics_repository` table: Real-time performance data from workstations

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout with metadata
│   ├── globals.css              # Global styles & design tokens
│   ├── audit/
│   │   └── page.tsx             # Manual audit & telemetry upload
│   ├── dashboard/
│   │   └── page.tsx             # Analytics dashboard
│   └── api/
│       ├── audits/
│       │   ├── save/route.ts     # POST - Save manual audit to DB
│       │   ├── list/route.ts     # GET - Retrieve all audits from DB
│       │   ├── details/route.ts  # GET - Get devices for specific audit
│       │   ├── stats/route.ts    # GET - Audit statistics
│       │   └── analysis/route.ts # GET - Audit analysis & insights
│       └── metrics/
│           ├── ingest/route.ts   # POST - Ingest telemetry CSV to DB
│           ├── latest/route.ts   # GET - Latest telemetry records
│           ├── stats/route.ts    # GET - Telemetry statistics
│           └── analysis/route.ts # GET - Telemetry analysis
├── components/
│   ├── audit/
│   │   ├── audit-form.tsx       # Manual audit form
│   │   ├── audit-list.tsx       # Display saved audits
│   │   └── telemetry-upload.tsx # CSV upload component
│   └── dashboard/
│       ├── audit-analysis.tsx    # Audit visualizations
│       └── telemetry-dashboard.tsx # Telemetry charts
├── lib/
│   ├── db.ts                    # PostgreSQL connection & queries
│   └── utils.ts                 # Utility functions
└── hooks/
    └── use-toast.ts             # Toast notifications
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ installed and running locally

### Step 1: Create PostgreSQL Databases

Open a PostgreSQL terminal and create two databases:

\`\`\`sql
CREATE DATABASE energy_db;
CREATE DATABASE workstation_monitor;
\`\`\`

### Step 2: Create Tables in energy_db

Connect to the `energy_db` database and run:

\`\`\`sql
-- Audits Table
CREATE TABLE audits (
  audit_id SERIAL PRIMARY KEY,
  audit_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  audit_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table with auto-calculated daily_kwh_total
CREATE TABLE devices (
  device_id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  device_class VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  power_rating_watts DECIMAL(10, 2),
  quantity INTEGER,
  hours_per_day DECIMAL(5, 2),
  daily_kwh_total DECIMAL(10, 4) GENERATED ALWAYS AS (
    (power_rating_watts * quantity * hours_per_day) / 1000
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_audit_id ON devices(audit_id);
\`\`\`

### Step 3: Create Tables in workstation_monitor

Connect to the `workstation_monitor` database and run:

\`\`\`sql
-- Metrics Repository Table for telemetry data
CREATE TABLE metrics_repository (
  id SERIAL PRIMARY KEY,
  timestamp_utc TIMESTAMP NOT NULL,
  computer_name VARCHAR(255) NOT NULL,
  cpu_percent DECIMAL(5, 2),
  mem_percent_used DECIMAL(5, 2),
  disk_bytes_sec BIGINT,
  inferred_watts DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_timestamp ON metrics_repository(timestamp_utc DESC);
CREATE INDEX idx_metrics_computer ON metrics_repository(computer_name);
\`\`\`

### Step 4: Install Dependencies

\`\`\`bash
npm install
\`\`\`

The `pg` library (PostgreSQL driver) is already in package.json and will be installed.

### Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory with your PostgreSQL connection string:

\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/energy_db
\`\`\`

Replace:
- `username` with your PostgreSQL user (default: `postgres`)
- `password` with your PostgreSQL password
- `localhost:5432` if your database is on a different host/port

**Example:**
\`\`\`env
DATABASE_URL=postgresql://postgres:password123@localhost:5432/energy_db
\`\`\`

**Note:** The application primarily uses `energy_db`. Telemetry is stored in the same database structure. If you need separate connections, create a separate env var `WORKSTATION_DB_URL`.

### Step 6: Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

## Usage Guide

### Creating a Manual Audit

1. Navigate to `http://localhost:3000/audit`
2. Click the **"Manual Audit"** tab
3. Fill in:
   - **Audit Name**: e.g., "Lab A Energy Audit"
   - **Location**: e.g., "Building 1, Lab 102"
   - **Audit Date**: Date of the audit
4. Add devices:
   - **Device Class**: Select Lighting, Servers, Workstations, HVAC, or Other
   - **Description**: e.g., "LED Ceiling Panels"
   - **Power Rating (W)**: Watts per device
   - **Quantity**: Number of devices
   - **Hours per Day**: Daily operational hours
   
   Daily kWh is automatically calculated as: `(Power_W × Quantity × Hours) / 1000`

5. Click **"Save Audit"**
6. Audit is saved to database and appears in:
   - "Saved Manual Audits" section on the audit page
   - Dashboard analytics

### Uploading Telemetry Data

1. Navigate to `http://localhost:3000/audit`
2. Click the **"Upload Telemetry"** tab
3. Paste CSV data in the following format:

\`\`\`
timestamp_utc,computer_name,cpu_percent,mem_percent_used,disk_bytes_sec,inferred_watts
2025-01-15T10:00:00Z,LAB-PC-01,45.2,62.1,1024000,250.5
2025-01-15T10:05:00Z,LAB-PC-01,48.1,65.3,1048576,265.2
2025-01-15T10:00:00Z,LAB-PC-02,12.3,42.8,512000,120.3
\`\`\`

4. Click **"Upload Data"**
5. Data is saved to `metrics_repository` table and immediately available in dashboard

### Dashboard Analytics

Navigate to `http://localhost:3000/dashboard` to view:

**Manual Audit Analytics:**
- Total audits saved in database
- Energy consumption by location
- Energy consumption by device class (Lighting, Servers, etc.)
- Comparative insights across labs

**Telemetry Analytics:**
- Time-series graph of inferred watts over time
- CPU % vs. Power correlation
- Energy consumption by computer
- Peak usage statistics

## Expected Data After Setup

### After Saving a Manual Audit
The data flows as follows:
1. Audit is inserted into `energy_db.audits` table
2. Devices are inserted into `energy_db.devices` table with auto-calculated `daily_kwh_total`
3. Data appears in "Saved Manual Audits" section within 2 seconds
4. Dashboard statistics update automatically

### After Uploading Telemetry CSV
1. CSV rows are parsed and inserted into `workstation_monitor.metrics_repository` table
2. Data appears in Telemetry Dashboard
3. Charts show time-series of power consumption and CPU usage
4. Idle waste detection identifies machines using energy during off-hours

## Database Schema

### energy_db.audits
| Column | Type | Description |
|--------|------|-------------|
| audit_id | SERIAL PRIMARY KEY | Unique audit identifier |
| audit_name | VARCHAR(255) | Descriptive audit name |
| location | VARCHAR(255) | Physical location (building, lab) |
| audit_date | DATE | Date of audit |
| created_at | TIMESTAMP | Creation timestamp |

### energy_db.devices
| Column | Type | Description |
|--------|------|-------------|
| device_id | SERIAL PRIMARY KEY | Unique device identifier |
| audit_id | INTEGER FK | Reference to audit |
| device_class | VARCHAR(100) | Category (Lighting, Servers, etc.) |
| description | VARCHAR(255) | Device details |
| power_rating_watts | DECIMAL | Power per device (watts) |
| quantity | INTEGER | Number of devices |
| hours_per_day | DECIMAL | Daily operating hours |
| daily_kwh_total | DECIMAL GENERATED | Auto-calculated kWh per day |
| created_at | TIMESTAMP | Creation timestamp |

### workstation_monitor.metrics_repository
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique metric record ID |
| timestamp_utc | TIMESTAMP | UTC timestamp of measurement |
| computer_name | VARCHAR(255) | Workstation identifier |
| cpu_percent | DECIMAL | CPU utilization (0-100) |
| mem_percent_used | DECIMAL | Memory usage (0-100) |
| disk_bytes_sec | BIGINT | Disk I/O in bytes/sec |
| inferred_watts | DECIMAL | Estimated power consumption |
| created_at | TIMESTAMP | Record creation timestamp |

## API Endpoints

### Audit Endpoints

**GET /api/audits/list**
- Returns all saved audits from database
- Response: Array of audit objects

**POST /api/audits/save**
- Creates and saves a new audit with devices
- Body: `{ auditName, location, auditDate, devices: [...] }`
- Response: `{ auditId, devices: [...] }`

**GET /api/audits/details?id=1**
- Returns all devices for a specific audit
- Response: Array of device objects

**GET /api/audits/stats**
- Returns audit statistics (count, total kWh)
- Response: `{ totalAudits, totalDailyKwh }`

**GET /api/audits/analysis**
- Returns aggregated audit analysis
- Response: `{ byLocation: [...], byDeviceClass: [...] }`

### Telemetry Endpoints

**GET /api/metrics/latest**
- Returns latest 1000 telemetry records
- Response: Array of metric objects

**POST /api/metrics/ingest**
- Inserts CSV telemetry data into database
- Body: Raw CSV string
- Response: `{ insertedCount, ids: [...] }`

**GET /api/metrics/stats**
- Returns telemetry statistics
- Response: `{ totalRecords, uniqueComputers }`

**GET /api/metrics/analysis**
- Returns telemetry analysis
- Response: `{ byComputer: [...], peakUsage: [...], idleWaste: [...] }`

## Troubleshooting

**"Module not found: Can't resolve 'pg'"**
- Run `npm install` to install PostgreSQL driver

**"Error: connect ECONNREFUSED"**
- Ensure PostgreSQL is running: `pg_ctl start` (macOS/Linux) or check Services (Windows)
- Verify `DATABASE_URL` is correct in `.env.local`
- Test connection: `psql postgresql://username:password@localhost:5432/energy_db`

**"Tables don't exist" error**
- Verify you created the databases and ran the SQL schema commands
- Check database name in `DATABASE_URL` matches where you created the tables

**No data appearing after saving**
- Check browser console for API errors
- Verify `DATABASE_URL` is set correctly in `.env.local`
- Restart dev server after changing `.env.local`
- Check that data was actually inserted: `SELECT * FROM audits;` in psql

**Dashboard shows no data**
- Ensure audits/telemetry have been saved first
- Check API responses: Visit `http://localhost:3000/api/audits/list` in browser
- Verify SWR is fetching data (check Network tab in DevTools)

## Deployment to Vercel

1. **Push code to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variable: `DATABASE_URL=your_postgresql_connection_string`
   - Click Deploy

3. **Ensure PostgreSQL accessibility**
   - Your PostgreSQL must be accessible from Vercel (not localhost)
   - Use cloud PostgreSQL services (AWS RDS, Supabase, Neon, Railway, etc.)
   - Update `DATABASE_URL` to cloud database connection string

## Architecture Diagram

\`\`\`
Frontend (React + Next.js)
    ↓
API Routes (TypeScript)
    ↓
PostgreSQL Connection Pool (lib/db.ts)
    ↓
PostgreSQL Database
    ├── energy_db (audits + devices)
    └── workstation_monitor (metrics)
\`\`\`

## Key Insights Derived

### From Manual Audits
- **High-Consumption Locations**: Identify labs using most energy
- **Equipment Breakdown**: Compare Lighting vs. Servers energy consumption
- **Baseline Costs**: Understand static infrastructure costs

### From Telemetry
- **Idle Waste**: Machines wasting energy at nights/weekends
- **CPU-Power Correlation**: Establish workload-specific power baselines
- **Peak Usage Patterns**: Identify problem machines with high consumption
- **Optimization Opportunities**: Target specific devices/locations for upgrades

## Future Enhancements

- Real-time WebSocket updates for live telemetry
- User authentication and multi-tenant support
- Carbon footprint calculation and reporting
- Machine learning for predictive analysis
- Scheduled alerts for anomalies
- PDF report generation
- Data export functionality

## Support

For issues or questions, check:
- Console errors in browser DevTools
- Server logs in terminal
- PostgreSQL connection with: `psql postgresql://user:password@host:port/dbname`

---

**Built for sustainability with modern web technologies.**
