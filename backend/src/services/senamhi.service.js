import axios from "axios";
import https from "https";
import * as cheerio from "cheerio";

/**
 * 🧠 In-memory cache
 * Key format: `${sourceId}_${type}_${month}`
 * Stores parsed SENAMHI data to avoid redundant scraping.
 */
const senamhiCache = new Map();

/**
 * 🔹 Fetches the list of available variables for a given SENAMHI station.
 * Also preloads the latest month's data into cache.
 *
 * @param {string} sourceId - Station ID
 * @param {string} [type="H"] - Type of station ("H" for hydrometric, "M" for meteorological)
 * @returns {Promise<string[]>} - List of cleaned variable names
 */
export async function getSenamhiVariables(sourceId, type = "H") {
  try {
    console.log(`📡 Fetching SENAMHI variables for station ${sourceId} (${type})`);

    // 1️⃣ Fetch list of available months
    const dateListUrl = `https://web2.senamhi.gob.pe/include_mapas/_dat_esta_tipo.php?estaciones=${sourceId}`;
    const response = await axios.get(dateListUrl, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(response.data);
    const availableDates = [];
    $("select[name='CBOFiltro'] option").each((_, el) => {
      const value = $(el).attr("value")?.trim();
      if (value) availableDates.push(value);
    });

    if (availableDates.length === 0)
      throw new Error("No available months found for this station.");

    // Pick the most recent month
    const lastDate = availableDates.at(-1);
    const letterType = type === "Hidrometrica" ? "H" : "M";

    // 2️⃣ Fetch table to extract variable names
    const urlData = `https://web2.senamhi.gob.pe/include_mapas/_dat_esta_tipo02.php?estaciones=${sourceId}&tipo=CON&CBOFiltro=${lastDate}&t_e=${letterType}`;
    const resData = await axios.get(urlData, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $$ = cheerio.load(resData.data);
    const rows = [];
    $$("table tr").each((_, tr) => {
      const cells = $$(tr)
        .find("td")
        .map((_, td) => $$(td).text().trim())
        .get();
      if (cells.length > 0) rows.push(cells);
    });

    if (rows.length < 3) return [];

    const headers = rows[0].map((h) => h.trim());

    const variables = headers
      .slice(1)
      .map((v) =>
        v
          .replace(/TemperaturaMax/i, "Temperatura Max")
          .replace(/TemperaturaMin/i, "Temperatura Min")
          .replace(/Temperatura BulboSeco/i, "Temperatura Bulbo Seco")
          .replace(/Temperatura BulboHumedo/i, "Temperatura Bulbo Humedo")
          .replace(/DirecciondelViento 13h/i, "Direccion del Viento")
          .replace(/VelocidaddelViento 13h/i, "Velocidad del Viento")
          .replace(/CaudalRegistrado/i, "Caudal Registrado")
      )
      // 🧹 Filter out unwanted variables (wind data)
      .filter((v) => {
        const clean = v.toLowerCase();
        return (
          !clean.includes("direccion del viento") &&
          !clean.includes("velocidad del viento")
        );
      });

    console.log(`🔑 Variables for ${sourceId}:`, variables);

    // 3️⃣ Preload last month’s parsed data into cache
    const cacheKey = `${sourceId}_${type}_${lastDate}`;
    if (!senamhiCache.has(cacheKey)) {
      console.log(`🧠 Preloading data for ${lastDate} into cache...`);
      const parsedData = parseTableRowsToEntries(rows, letterType);
      senamhiCache.set(cacheKey, parsedData);
    }

    return variables;
  } catch (error) {
    console.error("❌ Error fetching SENAMHI variables:", error.message);
    return [];
  }
}

/**
 * 🔹 Fetches historical SENAMHI data with optional filters:
 *   - date range
 *   - variable selection
 *   - result limiting
 * Uses cache when available.
 */
export async function getSenamhiData(
  sourceId,
  type = "H",
  start,
  end,
  limit,
  variable
) {
  console.log(`📡 Fetching SENAMHI data for ${sourceId} (${type})`);

  // 1️⃣ Fetch list of available months
  const dateListUrl = `https://web2.senamhi.gob.pe/include_mapas/_dat_esta_tipo.php?estaciones=${sourceId}`;
  const response = await axios.get(dateListUrl, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const $ = cheerio.load(response.data);
  const availableDates = [];
  $("select[name='CBOFiltro'] option").each((_, el) => {
    const value = $(el).attr("value")?.trim();
    if (value) availableDates.push(value);
  });

  if (availableDates.length === 0)
    throw new Error("No available months found for this station.");

  // Utility: parse "yyyymm" → Date
  const parseDate = (yyyymm) => {
    const year = parseInt(yyyymm.slice(0, 4), 10);
    const month = parseInt(yyyymm.slice(4, 6), 10) - 1;
    return new Date(Date.UTC(year, month, 1));
  };

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  // 2️⃣ Filter months that overlap with the requested range
  let filteredDates = availableDates.filter((f) => {
    const monthStart = parseDate(f);
    const monthEnd = new Date(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth() + 1,
      0
    );
    if (startDate && monthEnd < startDate) return false;
    if (endDate && monthStart > endDate) return false;
    return true;
  });

  if (filteredDates.length === 0) {
    console.warn("⚠️ No months in range, defaulting to the most recent.");
    filteredDates = [availableDates.at(-1)];
  }

  console.log("📅 Months to process:", filteredDates.join(", "));

  const letterType = type === "Hidrometrica" ? "H" : "M";

  // 🔧 Helper to fetch a month's data (uses cache)
  async function fetchMonth(date) {
    const cacheKey = `${sourceId}_${type}_${date}`;
    if (senamhiCache.has(cacheKey)) {
      console.log(`⚡ Using cache for ${cacheKey}`);
      return senamhiCache.get(cacheKey);
    }

    const urlData = `https://web2.senamhi.gob.pe/include_mapas/_dat_esta_tipo02.php?estaciones=${sourceId}&tipo=CON&CBOFiltro=${date}&t_e=${letterType}`;
    try {
      const resData = await axios.get(urlData, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      const $$ = cheerio.load(resData.data);
      const rows = [];
      $$("table tr").each((_, tr) => {
        const cells = $$(tr)
          .find("td")
          .map((_, td) => $$(td).text().trim())
          .get();
        if (cells.length > 0) rows.push(cells);
      });

      if (rows.length < 3) return [];

      const parsed = parseTableRowsToEntries(rows, letterType);
      senamhiCache.set(cacheKey, parsed);
      return parsed;
    } catch (err) {
      console.warn(`⚠️ Error fetching month ${date}:`, err.message || err);
      return [];
    }
  }

  // 3️⃣ Download and aggregate data
  let allData = [];
  for (const date of filteredDates) {
    const monthData = await fetchMonth(date);
    if (monthData.length) allData = allData.concat(monthData);
  }

  console.log("📊 Total records fetched:", allData.length);

  // 4️⃣ Filter by exact date range
  let filteredData = allData.filter((item) => {
    const d = new Date(item.date);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  // 5️⃣ Fallback: return all data if no records within range
  if (filteredData.length === 0 && allData.length > 0) {
    console.warn(
      "⚠️ No data within the requested range, returning latest records."
    );
    filteredData = allData;
  }

  // 6️⃣ Optional: filter by variable name
  if (variable) {
    filteredData = filteredData.filter((item) => variable in item.data);
  }

  // 7️⃣ Optional: apply limit
  if (limit && filteredData.length > limit) {
    filteredData = filteredData.slice(-limit);
  }

  console.log(`✅ Returning ${filteredData.length} records from ${sourceId}`);
  return { stationId: sourceId, data: filteredData };
}

/**
 * 🔹 Converts SENAMHI table rows into a structured data format.
 * Handles both hydrometric and meteorological datasets.
 */
function parseTableRowsToEntries(rows, letterType = "H") {
  if (!rows || rows.length < 3) return [];

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(2);
  const variables = headers.slice(1);

  // Define measurement times per variable type
  const variableMoments = {};
  if (letterType === "M") {
    const fixedMoments = {
      "Temperatura BulboSeco (°c)": ["07", "13", "19"],
      "Temperatura BulboHumedo (°c)": ["07", "13", "19"],
      "Precipitacion (mm)": ["07", "19"],
      "TemperaturaMax (°c)": [],
      "TemperaturaMin (°c)": [],
      "DirecciondelViento 13h": ["13"],
      "VelocidaddelViento 13h (m/s)": ["13"],
    };
    for (const v of variables) variableMoments[v] = fixedMoments[v] ?? [];
  } else {
    const hydroMoments = {
      "Nivel del Rio (m)": ["06", "10", "14", "18"],
      "CaudalRegistrado (m3/s)": [],
    };
    for (const v of variables) variableMoments[v] = hydroMoments[v] || [];
  }

  // Month name → number map
  const monthMap = {
    ene: 1, enero: 1, feb: 2, febrero: 2, mar: 3, marzo: 3, abr: 4, abril: 4,
    may: 5, mayo: 5, jun: 6, junio: 6, jul: 7, julio: 7, ago: 8, agosto: 8,
    sep: 9, set: 9, septiembre: 9, setiembre: 9, oct: 10, octubre: 10,
    nov: 11, noviembre: 11, dic: 12, diciembre: 12,
  };

  // Parse SENAMHI date format (e.g., "01-ene-2024")
  const parseSenamhiDate = (rawDate) => {
    const parts = rawDate.split("-");
    if (parts.length !== 3) return null;
    const [day, monthText, year] = parts;
    const month = monthMap[monthText.toLowerCase()] || parseInt(monthText, 10);
    return new Date(Date.UTC(parseInt(year), month - 1, parseInt(day), 5, 0, 0));
  };

  // ️🔧 Build structured entries
  const parsed = dataRows.flatMap((row) => {
    const [rawDate, ...values] = row;
    const baseDate = parseSenamhiDate(rawDate);
    if (!baseDate || isNaN(baseDate)) return [];

    const entries = [];
    let idx = 0;

    for (const v of variables) {
      const cleanName = v
        .replace(/TemperaturaMax/i, "Temperatura Max")
        .replace(/TemperaturaMin/i, "Temperatura Min")
        .replace(/Temperatura BulboSeco/i, "Temperatura Bulbo Seco")
        .replace(/Temperatura BulboHumedo/i, "Temperatura Bulbo Humedo")
        .replace(/DirecciondelViento 13h/i, "Direccion del Viento")
        .replace(/VelocidaddelViento 13h/i, "Velocidad del Viento")
        .replace(/CaudalRegistrado/i, "Caudal Registrado");

      // Skip wind-related variables
      if (["Direccion del Viento", "Velocidad del Viento"].includes(cleanName))
        continue;

      const moments = variableMoments[v] || [];
      if (moments.length > 0) {
        for (const hour of moments) {
          const val = values[idx++];
          const num = parseFloat(val);
          const value = isNaN(num) || num === -999 ? null : num;
          const date = new Date(baseDate.getTime() + parseInt(hour) * 3600000);
          entries.push({
            timestamp: date.getTime(),
            date: date.toISOString(),
            data: { [cleanName]: value },
          });
        }
      } else {
        const val = values[idx++];
        const num = parseFloat(val);
        const value = isNaN(num) || num === -999 ? null : num;
        entries.push({
          timestamp: baseDate.getTime(),
          date: baseDate.toISOString(),
          data: { [cleanName]: value },
        });
      }
    }

    return entries;
  });

  return parsed;
}