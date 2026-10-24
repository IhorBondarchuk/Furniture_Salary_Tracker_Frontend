'use client';

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Card.module.css";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <section className={cn(styles.card, className)}>{children}</section>;
}
