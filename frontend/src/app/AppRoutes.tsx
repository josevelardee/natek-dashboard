import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../features/auth/layout/AuthLayout";

import Home from "../features/home/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import StationsPage from "../features/stations/pages/Stations";
import StationTabs from "../features/stations/pages/StationTabs";
import Predicciones from "../features/predictions/pages/Predictions";
import Reportes from "../features/reports/pages/Reports";
import Alertas from "../features/alerts/pages/Alerts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔹 Rutas públicas (login/register) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* 🔹 Rutas con layout principal */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/stations/:id" element={<StationTabs />} />
        <Route path="/predictions" element={<Predicciones />} />
        <Route path="/reports" element={<Reportes />} />
        <Route path="/alerts" element={<Alertas />} />
      </Route>
    </Routes>
  );
}