"use client";

import { WalletHub } from "@/components/layout/WalletHub";
import { useEffect, useState } from "react";

export function ResponsiveWalletHome() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (isMobile === null) {
    return <div className="min-h-[30vh]" aria-busy="true" />;
  }

  return <WalletHub view={isMobile ? "balance" : "overview"} />;
}
