'use client';

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/store/locale";
import { getCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/api/catalog";
import type { CatalogItem } from "@/lib/types";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatMoney, parsePrice } from "@/lib/utils";
import styles from "./page.module.css";

export default function CatalogPage() {
  const { t, intlLocale } = useI18n();
  const queryClient = useQueryClient();
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
      // ціна впливає на суми в записах і підсумок зарплати
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
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

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = parsePrice(itemPrice);
    if (!itemName.trim()) {
      setCreateError(t.catalog.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setCreateError(t.catalog.errors.priceInvalid);
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
      setEditError(t.catalog.errors.nameRequired);
      return;
    }
    if (price === null || price <= 0) {
      setEditError(t.catalog.errors.priceInvalid);
      return;
    }
    setEditError(null);
    updateMutation.mutate({ id: editingId, name: editName.trim(), price });
  };

  const handleDelete = (item: CatalogItem) => {
    if (!window.confirm(t.catalog.deleteConfirm(item.name))) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <div className={styles.page}>
      <TopNav />
      <div className={styles.shell}>
        <section className={styles.header}>
          <span className={styles.pretitle}>{t.catalog.pretitle}</span>
          <h1>{t.catalog.title}</h1>
          <p className={styles.subtitle}>{t.catalog.subtitle}</p>
        </section>

        <section className={styles.grid}>
          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{t.catalog.addTitle}</h2>
              <span>{t.catalog.catalogHint}</span>
            </div>
            <form className={styles.form} onSubmit={handleCreate}>
              <Input label={t.catalog.name} value={itemName} onChange={(event) => setItemName(event.target.value)} />
              <Input
                label={t.catalog.basePrice}
                type="text"
                inputMode="decimal"
                placeholder="12,50"
                value={itemPrice}
                onChange={(event) => setItemPrice(event.target.value)}
              />
              {createError ? <p className={styles.formError}>{createError}</p> : null}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t.common.saving : t.catalog.addSubmit}
              </Button>
            </form>
          </Card>

          <Card className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{t.catalog.catalogTitle}</h2>
              <span>{t.catalog.itemsCount(catalogQuery.data?.length ?? 0)}</span>
            </div>
            <div className={styles.catalogList}>
              {deleteMutation.isError ? <p className={styles.formError}>{deleteMutation.error.message}</p> : null}
              {catalogQuery.isError ? <p className={styles.formError}>{catalogQuery.error.message}</p> : null}
              {catalogQuery.isLoading ? (
                <p>{t.catalog.catalogLoading}</p>
              ) : (
                catalogQuery.data?.map((item) => (
                  <div key={item.id} className={styles.catalogRow}>
                    {editingId === item.id ? (
                      <form className={styles.form} onSubmit={handleUpdate}>
                        <Input label={t.catalog.name} value={editName} onChange={(event) => setEditName(event.target.value)} />
                        <Input
                          label={t.catalog.price}
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
        </section>
      </div>
    </div>
  );
}
