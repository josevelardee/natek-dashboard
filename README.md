# 🌎 Natek Platform

**Natek** is a complete monitoring platform developed by **Natek** for visualizing and managing hydrological data across Peru.  
It combines data from Natek’s monitoring stations — **NLevel**, **NFlow**, and climate stations — to support sustainable water management and early flood detection.

## 🧩 Repository Structure

```bash
├── frontend/     # React + Vite + MapLibre GL web dashboard
├── backend/      # Node.js + Express + PostgreSQL API
└── README.md
```
## 🚀 Features

### Frontend (React + MapLibre GL)
- 🗺️ Interactive map powered by **MapLibre GL JS**
- 📊 Historical charts for level, flow, rainfall, temperature, and wind
- 🔎 Station filtering and search by type or basin
- ⚙️ Real-time data integration with **ThingsBoard**
- 💡 Modern responsive UI built with **TailwindCSS** and **Shadcn UI**

### 🧱 Frontend Structure
The frontend is a React + Vite application organized using a feature-based architecture, where each feature (e.g., stations, users, map) contains its own components, services, and logic.
This improves scalability, maintainability, and collaboration across the team.
```bash
frontend/
├── public/                     # Static assets (icons, logos, etc.)
├── src/
│   ├── app/                    # Application entry point, routes, and main setup
│   ├── assets/                 # Global styles, images, and design variables
│   ├── components/             # Reusable shared UI components
│   │   ├── map/                # MapLibre GL integration and layer management
│   │   └── layout/             # Global layouts (sidebar, topbar, etc.)
│   ├── context/                # Global React contexts (UserContext, UIContext)
│   ├── features/               # Main application features (domain-driven)
│   │   ├── auth/               # Authentication (login, user session)
│   │   ├── stations/           # Station management and telemetry visualization
│   │   │   ├── components/     # Station-specific UI (charts, popups, etc.)
│   │   │   ├── services/       # API communication for stations
│   │   │   ├── hooks/          # Custom logic hooks for station behavior
│   │   │   └── pages/          # Feature pages (StationList, StationDetail)
│   │   ├── home/           
│   │   ├── predictions/       
│   │   ├── alerts/           
│   │   └── reports/          
│   └── types/                  # Shared TypeScript types and interfaces
│
├── .env.example                # Example environment variables
├── package.json                # Project dependencies and scripts
└── vite.config.js              # Vite configuration and build setup
```

### Backend (Node.js + PostgreSQL)
- 🔐 Secure authentication with **ThingsBoard API**
- 🧠 Automatic token renewal for telemetry requests
- 📦 REST API for stations, telemetry history, and device variables
- 💾 PostgreSQL integration for metadata and configuration storage
- 🪶 Lightweight Express architecture, optimized for cloud deployment

## 🛠️ Technologies

| Layer | Stack |
|-------|--------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Shadcn UI |
| **Maps** | MapLibre GL JS |
| **Charts** | Recharts |
| **Backend** | Node.js, Express, Axios |
| **Database** | PostgreSQL |
| **IoT Integration** | ThingsBoard REST API |

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/natek/natek-platform.git
cd natek-platform
```
### 2️⃣ Install dependencies
```bash
Frontend
cd frontend
npm install
```
```bash
Backend
cd ../backend
npm install
```
### 3️⃣ Create a `.env` file inside the **backend** folder with the following structure

```bash
# 🌐 ThingsBoard connection
TB_URL=https://viewer.natek.lat
TB_USERNAME=your_tb_username
TB_PASSWORD=your_tb_password

# 🚀 Server configuration
PORT=3500

# 🗄️ PostgreSQL database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=5432

# 🔐 JWT secret for authentication (if used)
JWT_SECRET=your_secret_key
```
### 4️⃣ Run the project
```bash
cd backend
npm run dev
Visit the app at 👉 http://localhost:3500/natek-dashboard
```


