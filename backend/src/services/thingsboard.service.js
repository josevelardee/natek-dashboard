import axios from "axios";

const { TB_URL, TB_USERNAME, TB_PASSWORD } = process.env;

let TB_TOKEN = null;
let TOKEN_EXPIRY = null;

// 🚫 Keys that should be hidden from the frontend
const HIDDEN_KEYS = ["ping", "usage", "disk_usage", "video_id", "waterlevel", "velocimetry"];

/**
 * 🔐 Log in to ThingsBoard and store JWT token temporarily.
 */
async function loginToThingsBoard() {
  const url = `${TB_URL}/api/auth/login`;
  const { data } = await axios.post(url, {
    username: TB_USERNAME,
    password: TB_PASSWORD,
  });

  TB_TOKEN = data.token;
  TOKEN_EXPIRY = Date.now() + 24 * 60 * 60 * 1000; // 24h validity
  console.log("✅ Authenticated with ThingsBoard");
}

/**
 * 🧠 Ensure the JWT token is valid or refresh it if expired.
 */
async function ensureAuth() {
  const expired = !TB_TOKEN || Date.now() > TOKEN_EXPIRY;
  if (expired) await loginToThingsBoard();
}

/**
 * 🔍 Fetch all available telemetry keys for a device.
 */
async function getAvailableKeys(deviceId) {
  await ensureAuth();

  const url = `${TB_URL}/api/plugins/telemetry/DEVICE/${deviceId}/keys/timeseries`;
  const { data } = await axios.get(url, {
    headers: { "X-Authorization": `Bearer ${TB_TOKEN}` },
  });

  const keys = Array.isArray(data) ? data : Object.keys(data || {});
  return keys.filter((k) => !HIDDEN_KEYS.includes(k)); // remove hidden keys
}

/**
 * 📋 Public function to get Natek device variables, excluding hidden ones.
 */
export async function getNatekVariables(deviceId) {
  try {
    const variables = await getAvailableKeys(deviceId);
    console.log(`🔑 Visible variables for ${deviceId}:`, variables);
    return variables;
  } catch (error) {
    console.error("❌ Failed to get ThingsBoard variables:", error.message);
    throw new Error("Unable to fetch available variables");
  }
}

/**
 * 📊 Fetch historical telemetry data from ThingsBoard.
 * Handles missing variables gracefully (returns empty dataset instead of throwing).
 */
export async function getNatekData(deviceId, start, end, limit = 500, variable = null) {
  try {
    await ensureAuth();

    // Convert input dates to timestamps
    const toTimestamp = (val) =>
      typeof val === "string" ? new Date(val).getTime() : val;

    const startTs = toTimestamp(start);
    const endTs = toTimestamp(end);

    // 🔑 Get all valid variables for the device
    let keys = await getAvailableKeys(deviceId);

    // 🎯 If a specific variable is requested, validate it
    if (variable) {
      if (!keys.includes(variable)) {
        console.warn(`⚠️ Variable '${variable}' not found for device ${deviceId}. Returning empty dataset.`);
        return { stationId: deviceId, data: [] };
      }
      keys = [variable];
    }

    // ⚙️ Build query parameters
    const params = {
      keys: keys.join(","),
      limit,
      orderBy: "DESC",
      agg: "NONE",
      interval: 0,
      intervalType: "MILLISECONDS",
      timeZone: "America/Lima",
      useStrictDataTypes: true,
    };

    if (startTs) params.startTs = startTs;
    if (endTs) params.endTs = endTs;

    const url = `${TB_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`;

    // 📡 Fetch telemetry data
    const { data } = await axios.get(url, {
      headers: { "X-Authorization": `Bearer ${TB_TOKEN}` },
      params,
    });

    // 🧩 Normalize data (group by timestamp)
    const timestamps = new Set();
    Object.keys(data)
      .filter((k) => !HIDDEN_KEYS.includes(k))
      .forEach((k) => (data[k] || []).forEach((d) => timestamps.add(d.ts)));

    const result = Array.from(timestamps)
      .sort((a, b) => a - b)
      .map((ts) => {
        const entry = { timestamp: ts, date: new Date(ts).toISOString(), data: {} };
        for (const k of Object.keys(data)) {
          if (HIDDEN_KEYS.includes(k)) continue;
          const point = (data[k] || []).find((d) => d.ts === ts);
          if (point) entry.data[k] = isNaN(point.value) ? point.value : parseFloat(point.value);
        }
        return entry;
      });

    console.log(
      `📡 ThingsBoard → Retrieved ${result.length} records for ${deviceId} ${
        variable ? `(variable: ${variable})` : "(all variables)"
      }`
    );

    return { stationId: deviceId, data: result };
  } catch (error) {
    // ♻️ Handle expired token automatically
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expired, reauthenticating...");
      TB_TOKEN = null;
      await ensureAuth();
      return getNatekData(deviceId, start, end, limit, variable);
    }

    console.error("❌ Error in getNatekData:", error.response?.data || error.message);
    throw new Error("Failed to fetch telemetry data from ThingsBoard");
  }
}