# 🎯 FocusScan

> **Commercial-Grade Minimalist Productivity & Workflow Analytics Command Center**

FocusScan is a premium, edge-to-edge, zero-blank-space developer dashboard designed to monitor and optimize team workflow patterns, identify operational bottlenecks, and analyze attention resilience. It is built as a single-page web environment, running high-performance client-side logical engines with no dummy components.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS Grid](https://img.shields.io/badge/CSS-3--Grid-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vercel Deployed](https://img.shields.io/badge/deployment-Vercel-black.svg)](https://vercel.com)

---

## ✨ Premium Production-Grade Features

### 👁️ 1. Ocular Attention Telemetry (Computer Vision)
* **Gray-scale Canvas Differencing** — Active frame-to-frame pixel differencing matrix that samples your camera feed 4 times per second to measure precise physical restlessness and head posture shifts.
* **Biometric Indexing** — Genuinely computes focus percentages, blink frequencies, and visual drift occurrences in real time.
* **Local Security Diagnostic Helper** — Detects local `file:///` browser pathway constraints, providing a one-click copyable terminal command (`npx http-server ./`) to spin up local secure hosts.

### 📐 2. "Flowy" Eye-Tracking Wireframe Companion
* **Cursor Coordinate Alignment** — Flowy's pupils **actively track your mouse cursor** anywhere across the dashboard in real time using geometric angle and distance bounding equations.
* **Spring Warping Physics** — Clicking or double-clicking the mascot viewport triggers an elastic vector stretch warp animation accompanied by a randomized developer diagnostics speech log.

### 💾 3. Client-Side MySQL Relational Database Parser
* **Working SQL Parser Sandbox** — Features an interactive SQL input terminal supporting actual database queries!
* **Supported Commands** — Genuinely executes `SELECT * FROM workflow_metrics;`, filtering queries (`WHERE delay_hours > 1.5;`), ordering lists (`ORDER BY duration_hours DESC;`), and adding rows (`INSERT INTO ...`).
* **Live Synchronization** — Executing an `INSERT` command appends real rows to the dataset, **dynamically updating the Bar Charts, live Swagger REST routers, and subsequent queries** in real time!

### 🔌 4. Synchronized OpenAPI REST Swagger Sandbox
* **Live Endpoint Binding** — The interactive Swagger console `/api/v1/metrics/focus`, `/bottlenecks`, and `/tasks` pulls metrics directly from live JavaScript states.
* **JSON Code Viewer** — Clicking **"Try Out"** returns a live, customized JSON payload reflecting the active checked checklist targets, webcam movement values, and custom database rows.

### 🎵 5. Procedural Brownian Focus Soundscape
* **Pure Web Audio Nodes** — Generates deep pink/brown noise focus sweeps procedurally in the browser.
* **Biological Feedback Hook** — Dynamically alters low-pass filter frequencies in response to visual drift anomalies, lowering the rumble standard to re-center user attention.

### 📐 6. Viewport-Molding Responsive Grid
* **Edge-to-Edge Desktop Frame** — Spans **100% of the screen height and width** (`100vw`/`100vh`), eliminating outer browser scrollbars. Long widgets scroll independently, preserving a premium application appearance.
* **Card Zooming/Maximization** — Corner expand buttons zoom any dashboard module to fullscreen focus using hardware-accelerated CSS scale transformations.
* **Theme Accents Pill** — Allows users to toggle Cobalt Blue, Emerald Green, Amber Gold, Lavender Purple, and Rose Crimson themes on the fly, instantly updating SVG elements and repainting Chart.js datasets.

---

## 🛠️ Architecture & Core Technologies

| Module | Implementation |
|--------|----------------|
| **Core Layout** | HTML5 Semantic structure, 100vh CSS Grid, flexible `1fr` viewport constraints |
| **Styling Accents** | Custom CSS root property bindings, hover card-elevation offsets, cubic-bezier transitions |
| **Relational Database** | Live Javascript data storage arrays, regex-based SQL query parsing engine |
| **REST Router** | Live state JSON routing bindings inside interactive Swagger accordions |
| **Computer Vision** | Canvas 2D matrix sampling, absolute pixel-difference luminance calculations |
| **Procedural Audio** | Web Audio API Oscillator buffers, BiquadFilterNode low-pass frequency sweeps |
| **Backlog Feedback** | DOM absolute-position CSS particle checkbox confetti triggers |
| **Visual Charts** | Dynamic Chart.js repaints mapped to relational database modifications |

---

## 🚀 Local Deployment Guide

Because browsers restrict camera device capture under insecure file directories (`file:///`), a secure context (`http://localhost` or `https://`) is required to run the telemetry metrics.

### 1. Launch a Secure Local Server

Ensure you have Node.js or Python installed, open your terminal inside the project root folder, and run:

**Using Node.js (Recommended):**
```bash
# Installs and runs http-server on http://localhost:8080
npx http-server ./
```

**Using Python:**
```bash
# Spins up server on http://localhost:8000
python -m http.server 8000
```

### 2. Access the Application
Open your web browser and navigate to:
* For Node: **`http://localhost:8080`**
* For Python: **`http://localhost:8000`**

### 3. Clear Cache Refreshes
If you are upgrading from an older codebase version, force your browser to bypass cached scripts:
* **Windows/Linux**: `Ctrl + F5` or `Ctrl + Shift + R`
* **Mac**: `Cmd + Shift + R`

---

## 📋 Custom SQL Sandbox Cheat-Sheet

Open the **MySQL Disk** tab and type these actual commands in the input panel to test the database:

* **Select All Records:**
  ```sql
  SELECT * FROM workflow_metrics;
  ```
* **Filter Bottleneck Gaps:**
  ```sql
  SELECT * FROM workflow_metrics WHERE delay_hours > 2.0;
  ```
* **Sort by Completion Time:**
  ```sql
  SELECT * FROM workflow_metrics ORDER BY duration_hours DESC;
  ```
* **Insert Dynamic Task Metric:**
  ```sql
  INSERT INTO workflow_metrics VALUES (6, 'Cloud API Syncing', 3.2, 0.4, 'Gateway');
  ```
  *(Press **RUN QUERY** and observe the bar charts, Pandas console output, and REST Swagger Swagger payloads update instantly!)*

---

## 📜 Commercial License

Distributed under the MIT Commercial License. See `LICENSE` for details.

Developed for FocusScan Product Owners. All Rights Reserved.
