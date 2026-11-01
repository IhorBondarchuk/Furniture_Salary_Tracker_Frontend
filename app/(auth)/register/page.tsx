'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import type { Role } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");
  const [adminCode, setAdminCode] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; adminCode?: string }>({});

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess(data) {
      setAuth(data);
      router.push(data.user.role === "admin" ? "/admin" : "/worker");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = t.auth.errors.nameRequired;
    else if (name.trim().length < 2) nextErrors.name = t.auth.errors.nameTooShort;
    if (!email.trim()) nextErrors.email = t.auth.errors.emailRequired;
    if (!password) nextErrors.password = t.auth.errors.passwordRequired;
    if (password && password.length < 6) nextErrors.password = t.auth.errors.passwordTooShort;
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = t.auth.errors.adminCodeRequired;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ name: name.trim(), email, password, role, adminCode: adminCode.trim() });
  };

  const errorMessage = translateAuthError(t, mutation.error?.message);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.lang} />
        <div className={styles.head}>
          <h1>{t.register.title}</h1>
          <p>{t.register.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input label={t.auth.name} type="text" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
          <Input
            label={t.auth.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label={t.auth.password}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          <Select label={t.register.role} value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="worker">{t.roles.worker}</option>
            <option value="admin">{t.roles.admin}</option>
          </Select>
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
          {mutation.isError ? <p className={styles.error}>{errorMessage}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t.register.creating : t.register.submit}
          </Button>
        </form>

        <p className={styles.footer}>
          {t.register.haveAccount} <Link href="/login">{t.register.loginLink}</Link>
        </p>
      </div>
    </main>
  );
}
