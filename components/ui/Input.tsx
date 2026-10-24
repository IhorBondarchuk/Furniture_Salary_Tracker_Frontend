'use client';

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input className={cn(styles.input, className)} {...props} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
