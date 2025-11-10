# 🌎 Natek Platform

**Natek** is a complete monitoring platform developed by **Natek** for visualizing and managing hydrological data across Peru.  
It combines data from Natek’s monitoring stations — **NLevel**, **NFlow**, and climate stations — to support sustainable water management and early flood detection.

---

## 🧩 Repository Structure

├── frontend/     # React + Vite + MapLibre GL web dashboard
├── backend/      # Node.js + Express + PostgreSQL API
└── README.md

---

## 🚀 Features

### Frontend (React + MapLibre GL)
- 🗺️ Interactive map powered by **MapLibre GL JS**
- 📊 Historical charts for level, flow, rainfall, temperature, and wind
- 🔎 Station filtering and search by type or location
- ⚙️ Real-time data integration with **ThingsBoard**
- 💡 Modern responsive UI built with **TailwindCSS** and **Shadcn UI**

### Backend (Node.js + PostgreSQL)
- 🔐 Secure authentication with **ThingsBoard API**
- 🧠 Automatic token renewal for telemetry requests
- 📦 REST API for stations, telemetry history, and device variables
- 💾 PostgreSQL integration for metadata and configuration storage
- 🪶 Lightweight Express architecture, optimized for cloud deployment

