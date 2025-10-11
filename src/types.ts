// src/types.ts
export interface Station {
  id: string | number;
  name: string;
  river?: string;
  lat: number;
  lon: number;
  level?: number;
  flow?: number;
  variables?: string[];
  data?: { date: string; level: number }[];
  
  // NUEVOS CAMPOS
  owner?: string;          // "Natek", "SENAMHI", "ANA", "INAIGEM", etc.
  subscribed?: boolean;    // true = usuario suscrito, false = no suscrito
  alertLevel?: "bajo" | "medio" | "alto"; // para el pulso de alerta
}