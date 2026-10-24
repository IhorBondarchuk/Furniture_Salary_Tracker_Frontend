'use client';

import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Select.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ className, label, error, children, ...props }: SelectProps) {
  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select className={cn(styles.select, className)} {...props}>
        {children}
      </select>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
