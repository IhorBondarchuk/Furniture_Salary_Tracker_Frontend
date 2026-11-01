'use client';

import { useEffect } from "react";
import { useI18n, useLocaleStore } from "@/lib/store/locale";

export function LocaleInitializer() {
  const { t, locale } = useI18n();

  useEffect(() => {
    useLocaleStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.meta.title;
  }, [locale, t]);

  return null;
}
