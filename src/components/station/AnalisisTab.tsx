import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, BarChart3, Sparkle,CalendarIcon,ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const variables = ["Nivel de agua", "Caudal", "Velocidad", "Temperatura", "Humedad"];
const units: Record<string, string> = {
  "Nivel de agua": "m",
  "Caudal": "m³/s",
  "Velocidad": "m/s",
  "Temperatura": "°C",
  "Humedad": "%"
};

// Generar datos simulados (20 días)
const mockData = Array.from({ length: 20 }, (_, i) => {
  const date = new Date(2025, 9, i + 1); // Octubre 2025
  return {
    date: date.toISOString().split("T")[0],
    "Nivel de agua": +(0.8 + i * 0.01).toFixed(2),
    "Caudal": +(3.2 + i * 0.1).toFixed(2),
    "Velocidad": +(1.1 + i * 0.05).toFixed(2),
    "Temperatura": +(14 + i * 0.2).toFixed(1),
    "Humedad": 75 + i,
  };
});

export default function AnalisisTab() {
  const [variable1, setVariable1] = useState(variables[0]);
  const [variable2, setVariable2] = useState(variables[1]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 9, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2025, 9, 20));

  const filteredData = mockData.filter((d) => {
    const date = new Date(d.date);
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  const handleExport = () => alert(`Exportando gráfico: ${variable1} vs ${variable2}`);

  return (
    <div className="flex flex-col gap-6 ">
      {/* Controles */}
      <div className="flex justify-between flex-wrap gap-4">
        {/* Variables */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col ">
            <Select value={variable1} onValueChange={setVariable1}>
              <label className="text-sm font-medium text-muted-foreground mb-1">Variable 1</label>
              <SelectTrigger className="w-44 bg-white shadow-none">
                <SelectValue placeholder="Selecciona variable 1" />
              </SelectTrigger>
              <SelectContent>
                {variables.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col ">
            <Select value={variable2} onValueChange={setVariable2}>
              <label className="text-sm font-medium text-muted-foreground mb-1">Variable 2</label>
              <SelectTrigger className="w-44 bg-white shadow-none">
                <SelectValue placeholder="Selecciona variable 2" />
              </SelectTrigger>
              <SelectContent>
                {variables.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>



{/* Fechas */}
<div className="flex flex-col gap-1">

  <div className="flex items-end gap-0">
    {/* Fecha inicio */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-muted-foreground mb-1">Fecha de inicio</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left text-gray-700 font-normal shadow-none rounded-r-none px-3">
            {startDate
              ? format(startDate, "PPP", { locale: es })
              : "Fecha inicio"}
            <CalendarIcon className="h-4 w-4 text-gray-500 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={4} className="p-0 w-auto shadow-none">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            locale={es}
            initialFocus
            classNames={{
              day_selected:
                "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>

    {/* Icono entre fechas */}
    <div className="h-9 w-9 flex items-center justify-center bg-gray-200 border-y border-gray-200">
      <ArrowRight className="text-gray-500" size={18} />
    </div>

    {/* Fecha fin */}
    <div className="flex flex-col">
      <label className="text-sm font-medium text-muted-foreground mb-1">Fecha de fin</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left text-gray-700 font-normal shadow-none rounded-l-none px-3">
            {endDate
              ? format(endDate, "PPP", { locale: es })
              : "Fecha fin"}
            <CalendarIcon className="h-4 w-4 text-gray-500 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={4} className="p-0 w-auto shadow-none">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            locale={es}
            initialFocus
            classNames={{
              day_selected:
                "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>
</div>



      </div>

      {/* Gráfico + Card descriptivo */}
      <div className="flex flex-col lg:flex-row gap-6">

<div className="flex-1 lg:flex-[3] flex flex-col bg-white rounded-lg border border-gray-200">
  <div className="flex justify-between items-center mb-2 border-b border-gray-200 p-3">
    <h3 className="flex items-center gap-2 text-gray-700 font-semibold text-md">
      <BarChart3 size={20} className="text-blue-600" /> {variable1} vs {variable2}
    </h3>
    <button onClick={handleExport} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
      <Download size={20} /> Exportar
    </button>
  </div>

  {/* contenedor con altura fija */}
  <div className="p-0 w-full h-100 lg:h-140">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        style={{ fontSize: 14 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          label={{
            value: units[variable1],
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12 },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          label={{
            value: units[variable2],
            angle: 90,
            position: "insideRight",
            style: { fontSize: 12 },
          }}
        />
        <Tooltip wrapperStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="left" type="monotone" dataKey={variable1} stroke="#2563eb" activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey={variable2} stroke="#f97316" />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>



        {/* Card descriptivo */}
        <Card className="flex-1 lg:flex-[1]">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Sparkle size={20} className="text-blue-600" /> Análisis automático IA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 overflow-auto">
            <p>
              Aquí se mostrará un análisis automático generado por IA sobre las variables seleccionadas en el rango de fechas elegido.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}