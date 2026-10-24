'use client';

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { getCatalog } from "@/lib/api/catalog";
import { createRecord, getRecords, getSalarySummary } from "@/lib/api/records";
import type { CatalogItem, RecordPayload, SalarySummary, WorkRecord } from "@/lib/types";
import { TopNav } from "@/components/layout/TopNav";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { defaultMonthRange, formatDate, formatMoney } from "@/lib/utils";
import styles from "./page.module.css";

export default function WorkerPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [range, setRange] = useState(defaultMonthRange);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [date, setDate] = useState(range.to);
  const [formError, setFormError] = useState<string | null>(null);

  const catalogQuery = useQuery<CatalogItem[]>({
    queryKey: ["catalog"],
    queryFn: getCatalog,
  });

  const recordsQuery = useQuery<WorkRecord[]>({
    queryKey: ["records", user?.id, range.from, range.to],
    queryFn: () => getRecords({ workerId: user?.id, from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const summaryQuery = useQuery<SalarySummary>({
    queryKey: ["summary", user?.id, range.from, range.to],
    queryFn: () => getSalarySummary({ workerId: user?.id, from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const createMutation = useMutation<WorkRecord, Error, RecordPayload>({
    mutationFn: createRecord,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setFormError(null);
    },
    onError(error) {
      setFormError(error.message);
    },
  });

  const catalogItems = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);
  const selectedItem = useMemo(() => catalogItems.find((item) => item.id === itemId) ?? catalogItems[0], [catalogItems, itemId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItem) {
      setFormError("Оберіть позицію з каталогу");
      return;
    }
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1) {
      setFormError("Кількість має бути цілим числом, щонайменше 1");
      return;
    }
    setFormError(null);
    createMutation.mutate({ furniture: selectedItem.id, quantity: count, date });
  };

  return (
    <ProtectedPage role="worker">
      <div className={styles.page}>
        <TopNav />
        <div className={styles.shell}>
          <section className={styles.hero}>
            <div>
              <span className={styles.pretitle}>Worker dashboard</span>
              <h1>Мої записи за вибраний період</h1>
              <p className={styles.subtitle}>
                Додавайте нові роботи та дивіться розрахунок зарплати за кожну позицію.
              </p>
            </div>
            <div className={styles.stats}>
              <Card>
                <p className={styles.statLabel}>Зароблено</p>
                <p className={styles.statValue}>{formatMoney(summaryQuery.data?.totalEarned ?? 0)}</p>
              </Card>
              <Card>
                <p className={styles.statLabel}>Записів</p>
                <p className={styles.statValue}>{recordsQuery.data?.length ?? 0}</p>
              </Card>
            </div>
          </section>

          <section className={styles.grid}>
            <Card className={styles.formCard}>
              <div className={styles.cardHeader}>
                <h2>Додати робочий запис</h2>
                <span>Позиція з каталогу + кількість + дата</span>
              </div>
              <form className={styles.recordForm} onSubmit={handleSubmit}>
                <Select label="Позиція" value={selectedItem?.id ?? ""} onChange={(event) => setItemId(event.target.value)}>
                  {catalogItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatMoney(item.price)}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Кількість"
                  type="number"
                  min={1}
                  value={quantity}
                  step={1}
                  onChange={(event) => setQuantity(event.target.value)}
                />

                <Input label="Дата" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                {formError ? <p className={styles.formError}>{formError}</p> : null}
                <Button type="submit" disabled={createMutation.isPending || !catalogItems.length}>
                  {createMutation.isPending ? "Зберігаємо..." : "Додати запис"}
                </Button>
              </form>
            </Card>

            <Card className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <h2>Фільтр періоду</h2>
                <span>Оберіть діапазон дат для розрахунку.</span>
              </div>
              <div className={styles.filterGrid}>
                <Input label="З" type="date" value={range.from} onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))} />
                <Input label="До" type="date" value={range.to} onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))} />
              </div>
            </Card>
          </section>

          <section className={styles.tableSection}>
            <div className={styles.tableHead}>
              <h2>Історія записів</h2>
              <span>За період {range.from} – {range.to}</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Позиція</th>
                    <th>Кількість</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} className={styles.cellCenter}>
                        Завантаження...
                      </td>
                    </tr>
                  ) : recordsQuery.data?.length ? (
                    recordsQuery.data.map((record) => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.itemName}</td>
                        <td>{record.quantity}</td>
                        <td className={styles.mono}>{formatMoney(record.earned)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.cellCenter}>
                        Немає записів за обраний період.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </ProtectedPage>
  );
}
