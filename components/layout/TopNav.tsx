'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { logoutUser } from "@/lib/api/auth";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./TopNav.module.css";

export function TopNav() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <Link href="/">{t.common.brand}</Link>
      </div>
      <div className={styles.links}>
        <LanguageSwitcher />
        {user ? (
          <>
            <span className={styles.role}>{t.roles[user.role]}</span>
            <span>{user.name}</span>
            <button type="button" onClick={handleLogout} className={styles.logout}>
              {t.common.logout}
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.link}>
            {t.common.login}
          </Link>
        )}
      </div>
    </header>
  );
}
