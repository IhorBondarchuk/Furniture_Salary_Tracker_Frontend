export type Role = "worker" | "admin";

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

export interface WorkRecord {
  id: string;
  workerId: string;
  workerName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  earned: number;
}

export interface RecordPayload {
  worker?: string;
  furniture: string;
  quantity: number;
  date?: string;
}

export interface SalarySummary {
  totalEarned: number;
  items: Array<{ itemId: string; itemName: string; price: number; quantity: number; earned: number }>;
}
