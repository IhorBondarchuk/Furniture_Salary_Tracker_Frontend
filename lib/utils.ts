export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// Польські злоті: "1 250 zł", дробові суми з грошами — "12,50 zł"
export function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "PLN",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Ціна з поля вводу: "12", "12.5", "12,50" (до 2 знаків після коми); null — якщо формат невірний
export function parsePrice(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

// YYYY-MM-DD у локальному часовому поясі (toISOString зсуває дату в UTC)
export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultMonthRange() {
  const now = new Date();
  return {
    from: toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toLocalDateString(now),
  };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
