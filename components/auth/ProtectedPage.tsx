'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import styles from "./ProtectedPage.module.css";

interface ProtectedPageProps {
  children: React.ReactNode;
  role?: "admin" | "worker";
}

export function ProtectedPage({ children, role }: ProtectedPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/worker");
    }
  }, [initialized, router, role, user]);

  if (!initialized || !user || (role && user.role !== role)) {
    return (
      <div className={styles.waitscreen}>
        <div className={styles.spinner} />
        <p>Перевірка доступу...</p>
      </div>
    );
  }

  return <>{children}</>;
}
