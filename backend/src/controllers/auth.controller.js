import { registerUser, loginUser, loginSocialUser } from "../services/auth.service.js";

// 🔹 Registro tradicional
export const register = async (req, res) => {
  try {
    const data = await registerUser(req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Login tradicional
export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body.email, req.body.password);
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// 🔹 Login social
export const socialLogin = async (req, res) => {
  try {
    const data = await loginSocialUser(req.body);
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};