'use client';

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocaleInitializer } from "@/components/i18n/LocaleInitializer";
import { AuthGate } from "@/components/auth/AuthGate";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleInitializer />
      <AuthGate>{children}</AuthGate>
    </QueryClientProvider>
  );
}
