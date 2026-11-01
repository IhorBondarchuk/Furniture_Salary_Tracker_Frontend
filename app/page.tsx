'use client';

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/lib/store/locale";
import styles from "./page.module.css";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className={styles.hero}>
      <LanguageSwitcher className={styles.lang} />
      <section className={styles.panel}>
        <div className={styles.intro}>
          <span className={styles.badge}>{t.home.badge}</span>
          <h1>{t.home.title}</h1>
          <p className={styles.description}>{t.home.description}</p>
          <div className={styles.actions}>
            <Link href="/login" className={styles.primary}>
              {t.common.login}
            </Link>
            <Link href="/register" className={styles.secondary}>
              {t.common.register}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
