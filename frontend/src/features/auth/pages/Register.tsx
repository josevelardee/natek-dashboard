import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
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

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/auth/register", form);
      navigate("/"); // ✅ Return to the homepage after registering
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar");
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-xl p-8">
      <CardHeader className="text-center space-y-2 mb-4">
        <CardTitle className="text-3xl font-bold text-gray-700">
          Crear cuenta
        </CardTitle>
        <CardDescription>
          Únete a la primera red descentralizada de monitoreo hídrico 💧
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Pérez"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Crear cuenta
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 mt-4">
        <Button variant="outline" className="w-full">
          Registrarse con Google
        </Button>

        <div className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}