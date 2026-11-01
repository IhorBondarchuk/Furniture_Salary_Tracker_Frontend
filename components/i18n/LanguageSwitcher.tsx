'use client';

import { LOCALES } from "@/lib/i18n/dictionaries";
import { useI18n, useLocaleStore } from "@/lib/store/locale";
import { cn } from "@/lib/utils";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div className={cn(styles.switcher, className)} role="group" aria-label={t.language.label}>
      {LOCALES.map((option) => (
        <button
          key={option.code}
          type="button"
          lang={option.code}
          title={option.name}
          aria-pressed={option.code === locale}
          className={cn(styles.option, option.code === locale && styles.active)}
          onClick={() => setLocale(option.code)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
