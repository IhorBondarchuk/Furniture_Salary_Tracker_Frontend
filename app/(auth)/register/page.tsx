'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";
import type { Role } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();
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

    if (!name.trim()) nextErrors.name = "Введіть ім'я";
    else if (name.trim().length < 2) nextErrors.name = "Ім'я має містити щонайменше 2 символи";
    if (!email.trim()) nextErrors.email = "Введіть електронну пошту";
    if (!password) nextErrors.password = "Введіть пароль";
    if (password && password.length < 6) nextErrors.password = "Пароль має містити щонайменше 6 символів";
    if (role === "admin" && !adminCode.trim()) nextErrors.adminCode = "Введіть код адміністратора";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    mutation.mutate({ name: name.trim(), email, password, role, adminCode: adminCode.trim() });
  };

  const errorMessage =
    mutation.error?.message === "Invalid admin code" ? "Невірний код адміністратора" : mutation.error?.message;

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
          <Select label="Роль" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="worker">Працівник</option>
            <option value="admin">Адміністратор</option>
          </Select>
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
          {mutation.isError ? <p className={styles.error}>{errorMessage}</p> : null}
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
