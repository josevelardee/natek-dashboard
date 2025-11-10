// src/routes/stations.routes.js
import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  getStations,
  getStationById,
  getTelemetryHistory,
  getStationVariables,
} from "../controllers/stations.controller.js";

const router = express.Router();

router.get("/", getStations);

router.get("/:stationId", getStationById);

router.get("/:stationId/variables", getStationVariables);

router.get("/:stationId/history", getTelemetryHistory);


export default router;