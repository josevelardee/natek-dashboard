// src/services/station.service.js
import { getDevicesFromTB, getAttributesFromDevice } from "./thingsboard.service.js";
import pool from "../db/index.js"; // conexión a Postgres

/**
 * 🔹 Sincroniza estaciones desde ThingsBoard y las guarda/actualiza en Postgres
 * - Genera id local (UUID) automáticamente
 * - Usa source_id = id del dispositivo ThingsBoard
 * - type = atributo "dtype"
 * - subtype = atributo "dsubtype"
 */
export const syncStations = async () => {
  try {
    const devices = await getDevicesFromTB();

    const stations = await Promise.all(
      devices.map(async (d) => {
        // Solicitamos los atributos relevantes desde ThingsBoard
        const attrs = await getAttributesFromDevice(d.id.id, [
          "lat",
          "lon",
          "owner",
          "dtype",     // tipo principal
          "dsubtype",  // subtipo
          "river",
          "basin_code",
          "year_start",
          "year_end",
          "status",
          "access_type",
          "license",
          "data_url",
        ]);

        return {
          source_id: d.id.id, // ID de ThingsBoard
          name: d.name,
          type: attrs.dtype || null, // <-- usa atributo dtype
          lat: attrs.lat || null,
          lon: attrs.lon || null,
          description: d.additionalInfo?.description || "",
          owner: attrs.owner || "NATEK",
          subtype: attrs.dsubtype || null, // <-- usa atributo dsubtype
          river: attrs.river || null,
          basin_code: attrs.basin_code || null,
          year_start: attrs.year_start ? parseInt(attrs.year_start) : null,
          year_end: attrs.year_end ? parseInt(attrs.year_end) : null,
          status: attrs.status || null,
          access_type: attrs.access_type || "private",
          license: attrs.license || null,
          data_url: attrs.data_url || null,
        };
      })
    );

    // Guardar o actualizar en la base de datos
    for (const st of stations) {
      await pool.query(
        `
        INSERT INTO stations (
          source_id, name, type, lat, lon, description, owner, subtype,
          river, basin_code, year_start, year_end, status, access_type,
          license, data_url, created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15,
          $16, NOW()
        )
        ON CONFLICT (source_id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          lat = EXCLUDED.lat,
          lon = EXCLUDED.lon,
          description = EXCLUDED.description,
          owner = EXCLUDED.owner,
          subtype = EXCLUDED.subtype,
          river = EXCLUDED.river,
          basin_code = EXCLUDED.basin_code,
          year_start = EXCLUDED.year_start,
          year_end = EXCLUDED.year_end,
          status = EXCLUDED.status,
          access_type = EXCLUDED.access_type,
          license = EXCLUDED.license,
          data_url = EXCLUDED.data_url;
        `,
        [
          st.source_id,
          st.name,
          st.type,
          st.lat,
          st.lon,
          st.description,
          st.owner,
          st.subtype,
          st.river,
          st.basin_code,
          st.year_start,
          st.year_end,
          st.status,
          st.access_type,
          st.license,
          st.data_url,
        ]
      );
    }

    console.log(`✅ ${stations.length} estaciones sincronizadas correctamente`);
    return stations;
  } catch (error) {
    console.error("❌ Error al sincronizar estaciones:", error);
    throw error;
  }
};

/**
 * 🔹 Obtener estaciones desde la base de datos
 */
export const getStationsFromDB = async () => {
  const { rows } = await pool.query("SELECT * FROM stations ORDER BY created_at DESC");
  return rows;
};