'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useI18n } from "@/lib/store/locale";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const setToken = useAuthStore((state) => state.setToken);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({});

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess({ token }) {
      setToken(token);
      router.replace("/");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!login.trim()) nextErrors.login = t.auth.errors.loginRequired;
    if (!password) nextErrors.password = t.auth.errors.passwordRequired;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ login: login.trim(), password });
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <LanguageSwitcher className={styles.lang} />
        <div className={styles.head}>
          <h1>{t.auth.title}</h1>
          <p>{t.auth.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label={t.auth.login}
            autoComplete="username"
            autoCapitalize="none"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            error={errors.login}
          />
          <Input
            label={t.auth.password}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          {mutation.isError ? <p className={styles.error}>{translateAuthError(t, mutation.error.message)}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t.common.loading : t.auth.submit}
          </Button>
        </form>
      </div>
    </main>
  );
}
