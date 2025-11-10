// src/services/subscription.service.js
import pool from "../db/index.js";

/**
 * Verifica si un usuario está suscrito a una estación
 */
export const checkSubscription = async (userId, deviceId) => {
  const result = await pool.query(
    "SELECT * FROM subscriptions WHERE user_id=$1 AND device_id=$2",
    [userId, deviceId]
  );
  return result.rowCount > 0;
};

/**
 * Crea una nueva suscripción
 */
export const createSubscription = async (userId, deviceId) => {
  const result = await pool.query(
    "INSERT INTO subscriptions (user_id, device_id) VALUES ($1, $2) RETURNING *",
    [userId, deviceId]
  );
  return result.rows[0];
};

/**
 * Obtiene todas las estaciones a las que está suscrito un usuario
 */
export const getUserSubscribedStations = async (userId) => {
  const result = await pool.query(
    `SELECT device_id, created_at
     FROM subscriptions
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
};

/**
 * Elimina una suscripción
 */
export const removeSubscription = async (userId, deviceId) => {
  await pool.query(
    "DELETE FROM subscriptions WHERE user_id=$1 AND device_id=$2",
    [userId, deviceId]
  );
};