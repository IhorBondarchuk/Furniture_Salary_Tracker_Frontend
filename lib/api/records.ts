import { apiFetch } from "@/lib/api/fetcher";
import type { RecordPayload, SalarySummary, WorkRecord } from "@/lib/types";

export interface RecordsQueryParams {
  from?: string;
  to?: string;
}

interface ApiRef {
  _id: string;
  name?: string;
  price?: number;
}

// У списку furniture populated; POST повертає його як id
interface ApiWorkEntry {
  _id: string;
  furniture: string | ApiRef | null;
  quantity: number;
  date: string;
}

interface ApiSalary {
  totalSalary: number;
  items: Array<{ furnitureId: string; furnitureName: string; price: number; quantity: number; total: number }>;
}

function asRef(value: string | ApiRef | null): ApiRef | null {
  if (!value) return null;
  return typeof value === "string" ? { _id: value } : value;
}

function normalizeWorkRecord(entry: ApiWorkEntry): WorkRecord {
  const furniture = asRef(entry.furniture);
  const quantity = Number(entry.quantity);

  return {
    id: entry._id,
    itemId: furniture?._id ?? "",
    itemName: furniture?.name ?? "",
    quantity,
    date: entry.date,
    // бекенд рахує зарплату за поточною ціною каталогу, тут так само
    earned: quantity * Number(furniture?.price ?? 0),
  };
}

function normalizeSalarySummary(payload: ApiSalary): SalarySummary {
  return {
    totalEarned: Number(payload.totalSalary ?? 0),
    items: (payload.items ?? []).map((item) => ({
      itemId: item.furnitureId,
      itemName: item.furnitureName,
      price: Number(item.price),
      quantity: Number(item.quantity),
      earned: Number(item.total),
    })),
  };
}

function buildQuery(params: RecordsQueryParams) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return query.toString();
}

export function getRecords(params: RecordsQueryParams) {
  return apiFetch<ApiWorkEntry[]>(`/work-entries?${buildQuery(params)}`).then((entries) => entries.map(normalizeWorkRecord));
}

export function createRecord(payload: RecordPayload) {
  return apiFetch<ApiWorkEntry>("/work-entries", {
    method: "POST",
    body: JSON.stringify({
      furniture: payload.furniture,
      quantity: payload.quantity,
      date: payload.date,
    }),
  }).then(normalizeWorkRecord);
}

export function updateRecord(id: string, payload: Pick<RecordPayload, "furniture" | "quantity" | "date">) {
  return apiFetch<ApiWorkEntry>(`/work-entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      furniture: payload.furniture,
      quantity: payload.quantity,
      date: payload.date,
    }),
  }).then(normalizeWorkRecord);
}

export function deleteRecord(id: string) {
  return apiFetch<void>(`/work-entries/${id}`, {
    method: "DELETE",
  });
}

export function getSalarySummary(params: RecordsQueryParams) {
  return apiFetch<ApiSalary>(`/work-entries/salary?${buildQuery(params)}`).then(normalizeSalarySummary);
}
