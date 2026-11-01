'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import type { Role } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [adminCode, setAdminCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; adminCode?: string }>({});

  // Відповідність ролі та код адміністратора перевіряє бекенд
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess(data) {
      setAuth(data);
      router.push(data.user.role === "admin" ? "/admin" : "/worker");
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!email.trim()) nextErrors.email = t.auth.errors.emailRequired;
    if (!password) nextErrors.password = t.auth.errors.passwordRequired;
    if (password && password.length < 6) nextErrors.password = t.auth.errors.passwordTooShort;
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = t.auth.errors.adminCodeRequired;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ email, password, role, adminCode: adminCode.trim() });
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.lang} />
        <div className={styles.head}>
          <h1>{t.login.title}</h1>
          <p>{role === "admin" ? t.login.adminSubtitle : t.login.workerSubtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Select label={t.login.loginAs} value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="worker">{t.roles.worker}</option>
            <option value="admin">{t.roles.admin}</option>
          </Select>
          <Input
            label={t.auth.email}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label={t.auth.password}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          {role === "admin" ? (
            <Input
              label={t.auth.adminCode}
              type="password"
              autoComplete="off"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              error={errors.adminCode}
            />
          ) : null}
          {mutation.isError ? <p className={styles.error}>{translateAuthError(t, mutation.error.message)}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t.common.loading : t.common.login}
          </Button>
        </form>

        <p className={styles.footer}>
          {t.login.noAccount} <Link href="/register">{t.login.registerLink}</Link>
        </p>
      </div>
    </main>
  );
}
