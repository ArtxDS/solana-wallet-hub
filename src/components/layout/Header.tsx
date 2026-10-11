"use client";

import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useEffect, useState } from "react";

function BrandMark() {
  return (
    <div
      className="relative h-8 w-8 shrink-0 min-[640px]:h-9 min-[640px]:w-9"
      aria-hidden="true"
    >
      <span className="absolute left-1 top-2 h-5 w-5 rotate-45 rounded-[5px] bg-primary shadow-[0_0_18px_rgba(153,69,255,0.48)]" />
      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-sm bg-secondary" />
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isScrolled
          ? "border-white/10 bg-[#0d0918]/85 shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-310 items-center justify-between px-4 min-[640px]:h-19 min-[640px]:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark />
          <div className="hidden min-w-0 min-[380px]:block">
            <div className="flex items-center gap-2.5">
              <span className="truncate text-sm font-semibold tracking-[-0.015em] text-white min-[640px]:text-base">
                Solana Wallet Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
