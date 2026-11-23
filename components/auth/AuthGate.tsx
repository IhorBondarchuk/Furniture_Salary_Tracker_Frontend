'use client';

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import styles from "./AuthGate.module.css";

const LOGIN_PATH = "/login";

// Без токена пускає лише на /login; з токеном — з /login одразу на записи
export function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);

  const onLoginPage = pathname === LOGIN_PATH;
  const allowed = hydrated && (token ? !onLoginPage : onLoginPage);

  useEffect(() => {
    if (!hydrated || allowed) return;
    router.replace(token ? "/" : LOGIN_PATH);
  }, [allowed, hydrated, router, token]);

  if (!allowed) {
    return (
      <div className={styles.waitscreen}>
        <div className={styles.spinner} />
        <p>{t.auth.checking}</p>
      </div>
    );
  }

  return <>{children}</>;
}
