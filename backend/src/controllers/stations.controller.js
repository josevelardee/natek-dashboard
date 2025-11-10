import { checkSubscription, createSubscription, getUserSubscribedStations, removeSubscription } from "../services/subscription.service.js";

import { fetchStationById,getStationHistory,getStationAvailableVariables } from "../services/stations.service.js";

import pool from "../db/index.js";

/**
 * 🔹 Listado público de estaciones
 */
export const getStations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stations");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron obtener las estaciones" });
  }
};


/**
 * Obtener info de una estación por ID
 */
export const getStationById = async (req, res) => {
  const { stationId } = req.params;
  console.log("Buscando estación con ID:", stationId);

  try {
    const station = await fetchStationById(stationId);
    if (!station) return res.status(404).json({ error: "Estación no encontrada" });
    res.json(station);
  } catch (err) {
    console.error("Error en getStationById:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// controllers/telemetry.controller.js
export const getStationVariables = async (req, res) => {
  try {
    const { stationId } = req.params;
    const variables = await getStationAvailableVariables(stationId);
    res.json({ stationId, variables });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔹 Telemetria de estaciones
 */
export const getTelemetryHistory = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { start, end, limit, key } = req.query;

    const result = await getStationHistory(stationId, { start, end, limit, key });
    res.json(result); // <-- no envolver en { stationId, data }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo obtener datos históricos" });
  }
};

/**
 * 🔹 Suscribirse a estación
 */
export const subscribeStation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    if (!deviceId) return res.status(400).json({ error: "deviceId es obligatorio" });

    const alreadySubscribed = await checkSubscription(userId, deviceId);
    if (alreadySubscribed) return res.status(400).json({ error: "Ya estás suscrito a esta estación" });

    const newSubscription = await createSubscription(userId, deviceId);
    res.json({ success: true, subscription: newSubscription });
  } catch (error) {
    console.error("Error en subscribeStation:", error);
    res.status(500).json({ error: "No se pudo crear la suscripción" });
  }
};

/**
 * 🔹 Listar estaciones suscritas por usuario
 */
export const getSubscribedStations = async (req, res) => {
  try {
    const userId = req.user.id;
    const stations = await getUserSubscribedStations(userId);
    res.json(stations);
  } catch (error) {
    console.error("Error en getSubscribedStations:", error);
    res.status(500).json({ error: "No se pudieron obtener las estaciones suscritas" });
  }
};

/**
 * 🔹 Cancelar suscripción
 */
export const unsubscribeStation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    if (!deviceId) return res.status(400).json({ error: "deviceId es obligatorio" });

    await removeSubscription(userId, deviceId);
    res.json({ message: "Suscripción cancelada correctamente" });
  } catch (error) {
    console.error("Error en unsubscribeStation:", error);
    res.status(500).json({ error: "No se pudo cancelar la suscripción" });
  }
};



