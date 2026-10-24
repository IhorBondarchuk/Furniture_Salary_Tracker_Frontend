import { apiFetch } from "@/lib/api/fetcher";
import type { RecordPayload, SalarySummary, WorkRecord } from "@/lib/types";

export interface RecordsQueryParams {
  workerId?: string;
  from?: string;
  to?: string;
}

interface ApiRef {
  _id: string;
  name?: string;
  price?: number;
}

// У списку worker і furniture populated; POST повертає їх як id
interface ApiWorkEntry {
  _id: string;
  worker: string | ApiRef;
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
  const worker = asRef(entry.worker);
  const furniture = asRef(entry.furniture);
  const quantity = Number(entry.quantity);

  return {
    id: entry._id,
    workerId: worker?._id ?? "",
    workerName: worker?.name ?? worker?._id ?? "",
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
  if (params.workerId) query.set("worker", params.workerId);
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
      worker: payload.worker,
      furniture: payload.furniture,
      quantity: payload.quantity,
      date: payload.date,
    }),
  }).then(normalizeWorkRecord);
}

export function getSalarySummary(params: RecordsQueryParams) {
  return apiFetch<ApiSalary>(`/work-entries/salary?${buildQuery(params)}`).then(normalizeSalarySummary);
}
