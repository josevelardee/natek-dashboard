// src/scripts/syncStationsCron.js
import 'dotenv/config'; // ✅ Esto carga el .env automáticamente

import { syncStations } from "../services/sync.station.service.js";

// Intervalo en minutos
const INTERVAL_MINUTES = 60;

const runSync = async () => {
  try {
    console.log(`[${new Date().toISOString()}] 🔄 Sincronizando estaciones...`);
    const stations = await syncStations();
    console.log(`[${new Date().toISOString()}] ✅ ${stations.length} estaciones sincronizadas`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error al sincronizar estaciones:`, error);
  }
};

// Primer run
runSync();

// Ejecutar cada INTERVAL_MINUTES minutos
setInterval(runSync, INTERVAL_MINUTES * 60 * 1000);