import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  const backgroundUrl = `${import.meta.env.BASE_URL}background.png`;
  const logoUrl = `${import.meta.env.BASE_URL}natek-logo-white.png`;

  return (
    <div
      className="relative flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      {/* 🔹 Logo Natek arriba a la izquierda */}
      <img
        src={logoUrl}
        alt="Natek Logo"
        className="absolute top-6 left-8 h-10"
      />

      {/* 🔹 Contenido (por ejemplo, el formulario de login) */}
      <div className="w-full max-w-md px-4">
        <Outlet />
      </div>

      {/* 🔹 Filtro sutil si quieres mejor contraste */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] -z-10" />
    </div>
  );
}