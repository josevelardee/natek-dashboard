import pool from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// 🔹 Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// 🔹 Registro tradicional
export const registerUser = async ({ fullName, email, password, phone, avatarUrl, organization, city, country }) => {
  if (!fullName) throw new Error("El nombre completo es obligatorio");
  if (!email) throw new Error("El email es obligatorio");
  if (!password) throw new Error("La contraseña es obligatoria");

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users 
      (full_name, email, password_hash, provider, email_verified, phone, avatar_url, organization, city, country)
     VALUES ($1,$2,$3,'local',false,$4,$5,$6,$7,$8)
     RETURNING id, full_name, email, phone, avatar_url, organization, city, country, provider, email_verified, created_at`,
    [fullName, email, password_hash, phone || null, avatarUrl || null, organization || null, city || null, country || null]
  );

  const user = rows[0];
  return { user, token: generateToken(user) };
};

// 🔹 Login tradicional
export const loginUser = async (email, password) => {
  if (!email || !password) throw new Error("Email y contraseña son obligatorios");

  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1 AND provider='local'", [email]);
  if (!rows.length) throw new Error("Usuario no encontrado");

  const user = rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error("Contraseña incorrecta");

  return { token: generateToken(user), user: { 
    id: user.id, email: user.email, fullName: user.full_name, phone: user.phone, avatarUrl: user.avatar_url,
    organization: user.organization, city: user.city, country: user.country, provider: user.provider
  } };
};

// 🔹 Login social
export const loginSocialUser = async ({ provider, socialToken, fullName, phone, avatarUrl, organization, city, country }) => {
  if (!provider || !socialToken) throw new Error("Proveedor y token social son obligatorios");

  let email;
  if (provider === "google") {
    const resp = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${socialToken}`);
    email = resp.data.email;
    if (!fullName) fullName = resp.data.name; // nombre desde Google si no lo pasa frontend
  }
  // TODO: agregar otros proveedores

  if (!email) throw new Error("No se pudo obtener el email del proveedor social");
  if (!fullName) throw new Error("El nombre completo es obligatorio");

  // Verificar si existe usuario
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1 AND provider=$2", [email, provider]);
  let user;
  if (rows.length) {
    user = rows[0];
  } else {
    // Crear usuario nuevo
    const result = await pool.query(
      `INSERT INTO users 
        (full_name, email, provider, email_verified, phone, avatar_url, organization, city, country)
       VALUES ($1,$2,$3,true,$4,$5,$6,$7,$8)
       RETURNING id, full_name, email, phone, avatar_url, organization, city, country, provider, email_verified, created_at`,
      [fullName, email, provider, phone || null, avatarUrl || null, organization || null, city || null, country || null]
    );
    user = result.rows[0];
  }

  return { token: generateToken(user), user: { 
    id: user.id, email: user.email, fullName: user.full_name, phone: user.phone, avatarUrl: user.avatar_url,
    organization: user.organization, city: user.city, country: user.country, provider: user.provider
  } };
};