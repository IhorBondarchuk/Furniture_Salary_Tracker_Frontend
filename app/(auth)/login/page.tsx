'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, translateAuthError } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import type { Role } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
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

    if (!email.trim()) nextErrors.email = "Введіть електронну пошту";
    if (!password) nextErrors.password = "Введіть пароль";
    if (password && password.length < 6) nextErrors.password = "Пароль має містити щонайменше 6 символів";
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = "Введіть код адміністратора";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ email, password, role, adminCode: adminCode.trim() });
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h1>Вхід до Верстака</h1>
          <p>
            {role === "admin"
              ? "Увійдіть, щоб керувати каталогом меблів та переглядати записи всіх працівників."
              : "Увійдіть, щоб переглянути свої виробничі записи та розрахунок зарплати."}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Select label="Увійти як" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="worker">Працівник</option>
            <option value="admin">Адміністратор</option>
          </Select>
          <Input
            label="Електронна пошта"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          {role === "admin" ? (
            <Input
              label="Код адміністратора"
              type="password"
              autoComplete="off"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              error={errors.adminCode}
            />
          ) : null}
          {mutation.isError ? <p className={styles.error}>{translateAuthError(mutation.error.message)}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Завантаження..." : "Увійти"}
          </Button>
        </form>

        <p className={styles.footer}>
          Немає облікового запису? <Link href="/register">Зареєструватися</Link>
        </p>
      </div>
    </main>
  );
}
