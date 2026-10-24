'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, logoutUser } from "@/lib/api/auth";
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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const mutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const data = await loginUser(payload);
      // Роль визначає бекенд; вибір лише не пускає працівника через вхід адміністратора.
      if (role === "admin" && data.user.role !== "admin") {
        await logoutUser(data.accessToken).catch(() => undefined);
        throw new Error("Цей обліковий запис не має прав адміністратора");
      }
      return data;
    },
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

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ email, password });
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
          {mutation.isError ? <p className={styles.error}>{mutation.error.message}</p> : null}
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
