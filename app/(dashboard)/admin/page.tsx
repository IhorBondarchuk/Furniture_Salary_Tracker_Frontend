'use client';

import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { getCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/api/catalog";
import { getRecords } from "@/lib/api/records";
import type { CatalogItem, WorkRecord } from "@/lib/types";
import { TopNav } from "@/components/layout/TopNav";
import { ProtectedPage } from "@/components/auth/ProtectedPage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { defaultMonthRange, formatDate, formatMoney, parsePrice } from "@/lib/utils";
import styles from "./page.module.css";

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const { t, intlLocale } = useI18n();
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
    const price = parsePrice(itemPrice);
    if (!itemName.trim()) {
      setCreateError(t.admin.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setCreateError(t.admin.errors.priceInvalid);
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
    const price = parsePrice(editPrice);
    if (!editName.trim()) {
      setEditError(t.admin.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setEditError(t.admin.errors.priceInvalid);
      return;
    }
    setEditError(null);
    updateMutation.mutate({ id: editingId, name: editName.trim(), price });
  };

  const handleDelete = (item: CatalogItem) => {
    if (!window.confirm(t.admin.deleteConfirm(item.name))) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <ProtectedPage role="admin">
      <div className={styles.page}>
        <TopNav />
        <div className={styles.shell}>
          <section className={styles.header}>
            <div>
              <span className={styles.pretitle}>{t.admin.pretitle}</span>
              <h1>{t.admin.title}</h1>
              <p className={styles.subtitle}>{t.admin.subtitle}</p>
            </div>
            <div className={styles.stats}>
              <Card>
                <p className={styles.statLabel}>{t.admin.totalPayments}</p>
                <p className={styles.statValue}>{formatMoney(totalPayments, intlLocale)}</p>
              </Card>
              <Card>
                <p className={styles.statLabel}>{t.admin.topItem}</p>
                <p className={styles.statValue}>{topItems[0]?.itemName ?? t.common.none}</p>
              </Card>
            </div>
          </section>

          <section className={styles.grid}>
            <Card className={styles.adminCard}>
              <div className={styles.cardHeader}>
                <h2>{t.admin.catalogTitle}</h2>
                <span>{t.admin.catalogHint}</span>
              </div>
              <form className={styles.recordForm} onSubmit={handleCreate}>
                <Input label={t.admin.name} value={itemName} onChange={(event) => setItemName(event.target.value)} />
                <Input
                  label={t.admin.basePrice}
                  type="text"
                  inputMode="decimal"
                  placeholder="12,50"
                  value={itemPrice}
                  onChange={(event) => setItemPrice(event.target.value)}
                />
                {createError ? <p className={styles.formError}>{createError}</p> : null}
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t.common.saving : t.admin.addSubmit}
                </Button>
              </form>
              <div className={styles.catalogList}>
                {deleteMutation.isError ? <p className={styles.formError}>{deleteMutation.error.message}</p> : null}
                {catalogQuery.isError ? <p className={styles.formError}>{catalogQuery.error.message}</p> : null}
                {catalogQuery.isLoading ? (
                  <p>{t.admin.catalogLoading}</p>
                ) : (
                  catalogQuery.data?.map((item) => (
                    <div key={item.id} className={styles.catalogRow}>
                      {editingId === item.id ? (
                        <form className={styles.editForm} onSubmit={handleUpdate}>
                          <Input label={t.admin.name} value={editName} onChange={(event) => setEditName(event.target.value)} />
                          <Input
                            label={t.admin.price}
                            type="text"
                            inputMode="decimal"
                            value={editPrice}
                            onChange={(event) => setEditPrice(event.target.value)}
                          />
                          {editError ? <p className={styles.formError}>{editError}</p> : null}
                          <div className={styles.actionGroup}>
                            <Button type="submit" variant="secondary" disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? t.common.saving : t.common.save}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                              {t.common.cancel}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div>
                            <p className={styles.catalogName}>{item.name}</p>
                            <p className={styles.catalogMeta}>{formatMoney(item.price, intlLocale)}</p>
                          </div>
                          <div className={styles.actionGroup}>
                            <Button type="button" variant="secondary" onClick={() => startEdit(item)}>
                              {t.common.edit}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                              onClick={() => handleDelete(item)}
                            >
                              {t.common.delete}
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
                <h2>{t.admin.filterTitle}</h2>
                <span>{t.admin.filterHint}</span>
              </div>
              <div className={styles.filterGrid}>
                <Input label={t.common.from} type="date" value={range.from} onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))} />
                <Input label={t.common.to} type="date" value={range.to} onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))} />
              </div>
            </Card>
          </section>

          <section className={styles.recordsSection}>
            <div className={styles.tableHead}>
              <h2>{t.admin.recordsTitle}</h2>
              <span>{t.admin.period(range.from, range.to)}</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t.common.date}</th>
                    <th>{t.common.worker}</th>
                    <th>{t.common.item}</th>
                    <th>{t.common.quantity}</th>
                    <th>{t.common.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className={styles.cellCenter}>
                        {t.common.loading}
                      </td>
                    </tr>
                  ) : recordsQuery.data?.length ? (
                    recordsQuery.data.map((record) => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date, intlLocale)}</td>
                        <td>{record.workerName}</td>
                        <td>{record.itemName}</td>
                        <td>{record.quantity}</td>
                        <td className={styles.mono}>{formatMoney(record.earned, intlLocale)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.cellCenter}>
                        {t.common.noRecords}
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
