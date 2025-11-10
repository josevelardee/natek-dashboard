import pool from "../db/index.js"; // tu conexión a Postgres


/**
 * ➕ Agregar a favoritos
 */
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stationId } = req.params;
    const { source } = req.body; // 'public', 'natek', 'senamhi'

    await pool.query(
      `INSERT INTO favorites (user_id, station_id, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, station_id, source) DO NOTHING`,
      [userId, stationId, source]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error en addFavorite:", error);
    res.status(500).json({ error: "No se pudo agregar a favoritos" });
  }
};

/**
 * ❌ Quitar de favoritos
 */
// 🔹 Quitar de favoritos
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stationId } = req.params;
    const { source } = req.query; // 👈 se pasa como query param

    await pool.query(
      `
      DELETE FROM favorites 
      WHERE user_id=$1 AND station_id=$2 AND source=$3
      `,
      [userId, stationId, source]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error en removeFavorite:", error);
    res.status(500).json({ error: "No se pudo quitar de favoritos" });
  }
};

/**
 * 📋 Listar favoritos
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT station_id, source, created_at
       FROM favorites
       WHERE user_id=$1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error en getFavorites:", error);
    res.status(500).json({ error: "No se pudieron obtener los favoritos" });
  }
};