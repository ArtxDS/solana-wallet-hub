"use client";

import { useSolanaNetwork } from "@/components/providers/SolanaProvider";
import { cn } from "@/utils/cn";
import {
  NETWORK_LABELS,
  type SolanaNetwork,
} from "@/lib/solana/config";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { FlaskConical, Globe2 } from "lucide-react";

const networkOptions: Array<{
  value: SolanaNetwork;
  icon: typeof FlaskConical;
}> = [
  { value: WalletAdapterNetwork.Devnet, icon: FlaskConical },
  { value: WalletAdapterNetwork.Mainnet, icon: Globe2 },
];

type NetworkSwitcherProps = {
  onSelect?: () => void;
  className?: string;
};

export function NetworkSwitcher({ onSelect, className }: NetworkSwitcherProps) {
  const { network, setNetwork } = useSolanaNetwork();

  return (
    <div
      className={cn(
        "flex items-center rounded-xl border border-white/10 bg-white/[0.035] p-1",
        className,
      )}
      role="group"
      aria-label="Selecionar rede Solana"
    >
      {networkOptions.map(({ value, icon: Icon }) => {
        const isActive = value === network;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              setNetwork(value);
              onSelect?.();
            }}
            className={`flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow] duration-200 min-[640px]:px-2.5 min-[640px]:text-[11px] ${
              isActive
                ? value === WalletAdapterNetwork.Mainnet
                  ? "bg-positive/12 text-positive shadow-[0_0_18px_rgba(20,241,149,0.08)]"
                  : "bg-primary/15 text-secondary shadow-[0_0_18px_rgba(153,69,255,0.12)]"
                : "text-muted hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Icon size={13} aria-hidden="true" />
            <span className="hidden min-[640px]:inline">
              {NETWORK_LABELS[value]}
            </span>
            <span className="min-[640px]:hidden">
              {value === WalletAdapterNetwork.Mainnet ? "Main" : "Dev"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
