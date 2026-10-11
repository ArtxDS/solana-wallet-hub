"use client";

import { SolanaProvider } from "@/components/providers/SolanaProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
