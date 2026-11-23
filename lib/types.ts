export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

export interface WorkRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  date: string;
  earned: number;
}

export interface RecordPayload {
  furniture: string;
  quantity: number;
  date?: string;
}

export interface SalarySummary {
  totalEarned: number;
  items: Array<{ itemId: string; itemName: string; price: number; quantity: number; earned: number }>;
}
