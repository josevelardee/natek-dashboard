// services/stations.service.js
import { getNatekData, getNatekVariables } from "./thingsboard.service.js";
import { getSenamhiData, getSenamhiVariables } from "./senamhi.service.js";
import pool from "../db/index.js";

/**
 * 🧠 Retrieves the available telemetry variables for a given station.
 * It determines the data source (Natek or SENAMHI) based on the station’s owner.
 *
 * @param {string} stationId - UUID or identifier of the station
 * @returns {Promise<string[]>} - List of available variable names
 */
export async function getStationAvailableVariables(stationId) {
  const { rows } = await pool.query("SELECT * FROM stations WHERE id = $1", [stationId]);
  const station = rows[0];

  if (!station) {
    throw new Error(`Station not found: ${stationId}`);
  }

  // 🛰️ Fetch variables depending on data source
  switch (station.owner?.toUpperCase()) {
    case "NATEK":
      return await getNatekVariables(station.source_id);

    case "SENAMHI":
      return await getSenamhiVariables(station.source_id, station.type);

    default:
      throw new Error(`Unknown data source: ${station.owner}`);
  }
}

/**
 * 📊 Retrieves the historical telemetry data for a given station.
 * It determines the correct data source and calls the respective service.
 *
 * @param {string} stationId - UUID or identifier of the station
 * @param {Object} options - Query options
 * @param {string|number} options.start - Start date or timestamp
 * @param {string|number} options.end - End date or timestamp
 * @param {number} [options.limit] - Maximum number of records to fetch
 * @param {string} [options.key] - Specific variable name to retrieve
 * @returns {Promise<Object>} - Historical data from ThingsBoard or SENAMHI
 */
export async function getStationHistory(stationId, { start, end, limit, key }) {
  const { rows } = await pool.query("SELECT * FROM stations WHERE id = $1", [stationId]);
  const station = rows[0];

  if (!station) {
    throw new Error(`Station not found: ${stationId}`);
  }

  // ⚙️ Route data request to appropriate data provider
  switch (station.owner?.toUpperCase()) {
    case "NATEK":
      return await getNatekData(station.source_id, start, end, limit, key);

    case "SENAMHI":
      return await getSenamhiData(station.source_id, station.type, start, end, limit, key);

    default:
      throw new Error(`Unknown data source: ${station.owner}`);
  }
}

/**
 * 🔎 Fetches a single station by its ID from the database.
 *
 * @param {string} stationId - UUID or identifier of the station
 * @returns {Promise<Object|null>} - Station object or null if not found
 */
export async function fetchStationById(stationId) {
  const query = `
    SELECT *
    FROM stations
    WHERE id::text = $1
    LIMIT 1
  `;
  const values = [stationId];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}