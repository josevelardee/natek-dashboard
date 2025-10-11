interface SensorCardProps {
  label: string;
  valor: number | string;
  unidad?: string;
}

export default function SensorCard({ label, valor, unidad }: SensorCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-2xl font-semibold text-gray-800">
        {valor} {unidad}
      </span>
    </div>
  );
}