'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";
import styles from "./TopNav.module.css";

export function TopNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAuthStore((state) => state.clearToken);
  const links = [
    { href: "/", label: t.nav.records },
    { href: "/catalog", label: t.nav.catalog },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <Link href="/">{t.common.brand}</Link>
      </div>
      <div className={styles.links}>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(styles.link, pathname === link.href && styles.active)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher />
        <button
          type="button"
          className={styles.logout}
          onClick={() => {
            // токен без стану на сервері — достатньо забути його локально
            clearToken();
            router.replace("/login");
          }}
        >
          {t.nav.logout}
        </button>
      </div>
    </header>
  );
}
