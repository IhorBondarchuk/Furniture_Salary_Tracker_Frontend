'use client';

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { getCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/api/catalog";
import { getRecords } from "@/lib/api/records";
import type { CatalogItem, WorkRecord } from "@/lib/types";
import { TopNav } from "@/components/layout/TopNav";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { defaultMonthRange, formatDate, formatMoney } from "@/lib/utils";
import styles from "./page.module.css";

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [range, setRange] = useState(defaultMonthRange);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const catalogQuery = useQuery<CatalogItem[]>({
    queryKey: ["catalog"],
    queryFn: getCatalog,
  });

  const recordsQuery = useQuery<WorkRecord[]>({
    queryKey: ["records", range.from, range.to],
    queryFn: () => getRecords({ from: range.from, to: range.to }),
    enabled: Boolean(user),
  });

  const createMutation = useMutation<CatalogItem, Error, { name: string; price: number }>({
    mutationFn: createCatalogItem,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setItemName("");
      setItemPrice("");
      setCreateError(null);
    },
    onError(error) {
      setCreateError(error.message);
    },
  });

  const updateMutation = useMutation<CatalogItem, Error, { id: string; name: string; price: number }>({
    mutationFn: ({ id, name, price }) => updateCatalogItem(id, { name, price }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setEditingId(null);
      setEditError(null);
    },
    onError(error) {
      setEditError(error.message);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteCatalogItem(id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });

  const totalPayments = useMemo(
    () => recordsQuery.data?.reduce((sum, record) => sum + record.earned, 0) ?? 0,
    [recordsQuery.data],
  );

  const topItems = useMemo(() => {
    const breakdown = new Map<string, { quantity: number; earned: number }>();

    recordsQuery.data?.forEach((record) => {
      const existing = breakdown.get(record.itemName) ?? { quantity: 0, earned: 0 };
      existing.quantity += record.quantity;
      existing.earned += record.earned;
      breakdown.set(record.itemName, existing);
    });

    return Array.from(breakdown.entries())
      .map(([itemName, data]) => ({ itemName, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  }, [recordsQuery.data]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(itemPrice);
    if (!itemName.trim()) {
      setCreateError("Введіть назву позиції");
      return;
    }
    if (!itemPrice || price <= 0) {
      setCreateError("Ціна має бути більшою за 0");
      return;
    }
    setCreateError(null);
    createMutation.mutate({ name: itemName.trim(), price });
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditError(null);
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const price = Number(editPrice);
    if (!editName.trim()) {
      setEditError("Введіть назву позиції");
      return;
    }
    if (!editPrice || price <= 0) {
      setEditError("Ціна має бути більшою за 0");
      return;
    }
    setEditError(null);
    updateMutation.mutate({ id: editingId, name: editName.trim(), price });
  };

  const handleDelete = (item: CatalogItem) => {
    if (!window.confirm(`Видалити позицію «${item.name}»?`)) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <ProtectedPage role="admin">
      <div className={styles.page}>
        <TopNav />
        <div className={styles.shell}>
          <section className={styles.header}>
            <div>
              <span className={styles.pretitle}>Admin dashboard</span>
              <h1>Керування каталогом та робочими звітами</h1>
              <p className={styles.subtitle}>
                Додавайте позиції, перевіряйте записи всіх працівників та контролюйте виплати.
              </p>
            </div>
            <div className={styles.stats}>
              <Card>
                <p className={styles.statLabel}>Загальна виплата</p>
                <p className={styles.statValue}>{formatMoney(totalPayments)}</p>
              </Card>
              <Card>
                <p className={styles.statLabel}>Топ позиція</p>
                <p className={styles.statValue}>{topItems[0]?.itemName ?? "Немає"}</p>
              </Card>
            </div>
          </section>

          <section className={styles.grid}>
            <Card className={styles.adminCard}>
              <div className={styles.cardHeader}>
                <h2>Каталог меблів</h2>
                <span>Створюйте та редагуйте позиції для розрахунку зарплатні.</span>
              </div>
              <form className={styles.recordForm} onSubmit={handleCreate}>
                <Input label="Назва" value={itemName} onChange={(event) => setItemName(event.target.value)} />
                <Input
                  label="Базова ціна, zł"
                  type="number"
                  min={0}
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                />
                {createError ? <p className={styles.formError}>{createError}</p> : null}
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Зберігаємо..." : "Додати позицію"}
                </Button>
              </form>
              <div className={styles.catalogList}>
                {deleteMutation.isError ? <p className={styles.formError}>{deleteMutation.error.message}</p> : null}
                {catalogQuery.isError ? <p className={styles.formError}>{catalogQuery.error.message}</p> : null}
                {catalogQuery.isLoading ? (
                  <p>Завантаження каталогу…</p>
                ) : (
                  catalogQuery.data?.map((item) => (
                    <div key={item.id} className={styles.catalogRow}>
                      {editingId === item.id ? (
                        <form className={styles.editForm} onSubmit={handleUpdate}>
                          <Input label="Назва" value={editName} onChange={(event) => setEditName(event.target.value)} />
                          <Input
                            label="Ціна, zł"
                            type="number"
                            min={0}
                            value={editPrice}
                            onChange={(event) => setEditPrice(event.target.value)}
                          />
                          {editError ? <p className={styles.formError}>{editError}</p> : null}
                          <div className={styles.actionGroup}>
                            <Button type="submit" variant="secondary" disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? "Зберігаємо..." : "Зберегти"}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                              Скасувати
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className={styles.catalogName}>{item.name}</p>
                            <p className={styles.catalogMeta}>{formatMoney(item.price)}</p>
                          </div>
                          <div className={styles.actionGroup}>
                            <Button type="button" variant="secondary" onClick={() => startEdit(item)}>
                              Редагувати
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                              onClick={() => handleDelete(item)}
                            >
                              Видалити
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className={styles.adminCard}>
              <div className={styles.cardHeader}>
                <h2>Фільтр записів</h2>
                <span>Переглядайте зарплатні записи за діапазон дат.</span>
              </div>
              <div className={styles.filterGrid}>
                <Input label="З" type="date" value={range.from} onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))} />
                <Input label="До" type="date" value={range.to} onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))} />
              </div>
            </Card>
          </section>

          <section className={styles.recordsSection}>
            <div className={styles.tableHead}>
              <h2>Записи всіх працівників</h2>
              <span>Дані оновлюються за період {range.from} – {range.to}</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Працівник</th>
                    <th>Позиція</th>
                    <th>Кількість</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className={styles.cellCenter}>
                        Завантаження...
                      </td>
                    </tr>
                  ) : recordsQuery.data?.length ? (
                    recordsQuery.data.map((record) => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.workerName}</td>
                        <td>{record.itemName}</td>
                        <td>{record.quantity}</td>
                        <td className={styles.mono}>{formatMoney(record.earned)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.cellCenter}>
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
