'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { logoutUser } from "@/lib/api/auth";
import styles from "./TopNav.module.css";

export function TopNav() {
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
        <Link href="/">Верстак</Link>
      </div>
      <div className={styles.links}>
        {user ? (
          <>
            <span className={styles.role}>{user.role.toUpperCase()}</span>
            <span>{user.name}</span>
            <button type="button" onClick={handleLogout} className={styles.logout}>
              Вийти
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.link}>
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}
