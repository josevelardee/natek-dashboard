// src/controllers/thingsboard.controller.js
import { getDevicesFromTB, getTelemetryFromTB } from "../services/thingsboard.service.js";

export const getDevices = async (req, res) => {
  try {
    const devices = await getDevicesFromTB();
    res.json(devices);
  } catch (error) {
    console.error("Error al obtener dispositivos:", error.message);
    res.status(500).json({ error: "Error al obtener dispositivos" });
  }
};

export const getTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { keys } = req.query; // ej: ?keys=nivel,bateria,caudal
    const telemetry = await getTelemetryFromTB(deviceId, keys || "nivel");
    res.json(telemetry);
  } catch (error) {
    console.error("Error al obtener telemetría:", error.message);
    res.status(500).json({ error: "Error al obtener telemetría" });
  }
};