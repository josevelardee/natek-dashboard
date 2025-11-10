import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";
//import senamhiRoutes from "./src/routes/senamhi.routes.js";
//import thingsboardRoutes from "./src/routes/thingsboard.routes.js";
import stationsRoutes from "./src/routes/stations.routes.js";
import authRoutes from "./src/routes/auth.routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// 🔹 Rutas API
app.use("/api/stations", stationsRoutes);
app.use("/api/auth", authRoutes);

// 🔹 Frontend
app.use("/natek-dashboard", express.static(path.join(__dirname, "../frontend/dist")));
app.use("/natek-dashboard", (req, res) => {
  if (req.path.match(/\.(js|css|map|ico|svg|png|jpg|jpeg|gif)$/)) {
    return res.sendStatus(404);
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));