'use client';

import { useEffect } from "react";
import { refreshSession } from "@/lib/api/auth";

export function AuthInitializer() {
  useEffect(() => {
    // Успіх/невдача фіксуються в сторі всередині refreshSession.
    refreshSession().catch(() => undefined);
  }, []);

  return null;
}
