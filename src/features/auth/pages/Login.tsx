import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import type { User } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const resp = await axios.post("/api/auth/login", { email, password });
      setUser(resp.data.user as User);
      localStorage.setItem("token", resp.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error en login");
    }
  };

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-sm bg-white/95 backdrop-blur-md shadow-xl py-6">
        <CardHeader className="text-center space-y-4 mt-2">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Hola, bienvenido 👋
          </CardTitle>
          <CardDescription className="text-gray-500">
            Únete a la primera red descentralizada de monitoreo hídrico 💧
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:underline underline-offset-4"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Ingresar
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 mb-2">
          <Button variant="outline" className="w-full">
            Ingresar con Google
          </Button>

          <div className="text-sm text-center text-gray-600">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Crear cuenta
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}