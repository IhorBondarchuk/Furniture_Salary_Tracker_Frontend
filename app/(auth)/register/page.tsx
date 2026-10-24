'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const mutation = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) => registerUser(payload),
    onSuccess(data) {
      setAuth(data);
      router.push(data.user.role === "admin" ? "/admin" : "/worker");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = "Введіть ім'я";
    else if (name.trim().length < 2) nextErrors.name = "Ім'я має містити щонайменше 2 символи";
    if (!email.trim()) nextErrors.email = "Введіть електронну пошту";
    if (!password) nextErrors.password = "Введіть пароль";
    if (password && password.length < 6) nextErrors.password = "Пароль має містити щонайменше 6 символів";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ name: name.trim(), email, password });
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h1>Реєстрація нового користувача</h1>
          <p>Створіть обліковий запис для доступу до робочих записів та зарплатних звітів.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input label="Ім'я" type="text" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
          <Input
            label="Електронна пошта"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          {mutation.isError ? <p className={styles.error}>{(mutation.error as Error).message}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Створюємо..." : "Зареєструватися"}
          </Button>
        </form>

        <p className={styles.footer}>
          Вже маєте обліковий запис? <Link href="/login">Увійдіть</Link>
        </p>
      </div>
    </main>
  );
}
