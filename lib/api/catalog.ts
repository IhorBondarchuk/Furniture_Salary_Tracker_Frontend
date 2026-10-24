import { apiFetch } from "@/lib/api/fetcher";
import type { CatalogItem } from "@/lib/types";

interface ApiFurniture {
  _id: string;
  name: string;
  price: number;
}

interface CatalogItemInput {
  name: string;
  price: number;
}

function normalizeCatalogItem(item: ApiFurniture): CatalogItem {
  return {
    id: item._id,
    name: item.name,
    price: Number(item.price),
  };
}

export function getCatalog() {
  return apiFetch<ApiFurniture[]>("/furniture").then((items) => items.map(normalizeCatalogItem));
}

export function createCatalogItem(item: CatalogItemInput) {
  return apiFetch<ApiFurniture>("/furniture", {
    method: "POST",
    body: JSON.stringify({ name: item.name, price: item.price }),
  }).then(normalizeCatalogItem);
}

export function updateCatalogItem(id: string, item: CatalogItemInput) {
  return apiFetch<ApiFurniture>(`/furniture/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name: item.name, price: item.price }),
  }).then(normalizeCatalogItem);
}

export function deleteCatalogItem(id: string) {
  return apiFetch<void>(`/furniture/${id}`, {
    method: "DELETE",
  });
}
