// src/types.ts
export interface Station {
  id: string;
  sourceId?: string;
  name: string;
  code?: string; // CODIGO de SENAMHI
  lat: number;
  lon: number;  
  type?: string;
  subtype?: string;
  owner?: string;
  river?: string;
  basinCode?: string;
  yearStart?: number | null;
  yearEnd?: number | null;
  status?: string | null;
  license?: string;
  dataUrl?: string;
  accessType?: string; // "public" | "private"
  createdAt?: string;
  purchasable?: boolean;
  source?: string;
}

export type User = {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  provider: string;
  email_verified: boolean;
  avatar_url?: string;
  organization?: string;
  role: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at?: string;
};

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};