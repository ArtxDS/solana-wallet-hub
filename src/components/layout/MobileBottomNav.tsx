"use client";

import { NetworkSettings } from "@/components/layout/NetworkSettings";
import { History, Wallet, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/balance", label: "Saldo", icon: Wallet },
  { href: "/wallet", label: "Carteira", icon: WalletCards },
  { href: "/history", label: "Histórico", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0918]/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl min-[640px]:hidden"
      aria-label="Navegação mobile"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-3">
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href === "/balance" && pathname === "/");

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-full flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "text-secondary"
                  : "text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
        <div
          className="flex h-full flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-muted"
          role="group"
          aria-label="Selecionar rede"
        >
          <NetworkSettings compact navItem placement="top" />
          <span>Rede</span>
        </div>
      </div>
    </nav>
  );
}
