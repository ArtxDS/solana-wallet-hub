/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { NetworkSettings } from "@/components/layout/NetworkSettings";
import { Button } from "@/components/ui/button";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { Check, Copy, LogOut, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ConnectButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const address = publicKey?.toBase58() || "";
  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard?.writeText(address);
    setCopied(true);
    toast.success("Endereço copiado");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Carteira desconectada");
    } catch {
      toast.error("Erro ao desconectar");
    }
  };

  if (!mounted) {
    return (
      <Button variant="primary">
        <span className="min-[640px]:hidden">Carregando</span>
        <span className="hidden min-[640px]:inline">Carregando...</span>
      </Button>
    );
  }

  if (!connected) {
    return (
      <>
        <Button
          variant="primary"
          className="px-3 min-[640px]:px-4"
          onClick={() => setConnectModalOpen(true)}
        >
          <span className="min-[640px]:hidden">Conectar</span>
          <span className="hidden min-[640px]:inline">Conectar carteira</span>
        </Button>
        <WalletConnectModal
          open={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Link
        href="/wallet"
        className="mobile-header-control min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 text-muted transition-colors hover:border-primary/40 hover:bg-primary/[0.08] hover:text-white"
        aria-label="Abrir dados da carteira"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-secondary">
          <WalletCards size={14} />
        </span>
        <span className="max-w-20 truncate font-mono text-[11px] font-medium text-white">
          {shortAddress}
        </span>
      </Link>

      <div className="desktop-header-control min-w-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1 pl-3">
        <WalletCards
          size={15}
          className="mr-1 text-secondary"
          aria-hidden="true"
        />
        <span className="min-w-0 truncate font-mono text-xs font-medium text-white sm:text-sm">
          {shortAddress}
        </span>
        <Button
          variant="icon"
          onClick={copyAddress}
          className="h-8 min-h-8 w-8 shrink-0 rounded-lg p-0 text-muted/70 hover:text-white"
          aria-label={copied ? "Endereço copiado" : "Copiar endereço"}
        >
          {copied ? (
            <Check size={15} className="block shrink-0 text-positive" />
          ) : (
            <Copy size={15} className="block shrink-0 text-muted/70" />
          )}
        </Button>
        <div className="mx-1 h-4 w-px bg-white/10" aria-hidden="true" />
        <Button
          variant="icon"
          onClick={handleDisconnect}
          className="h-8 min-h-8 w-8 shrink-0 rounded-lg p-0 text-muted/70 hover:text-white"
          aria-label="Desconectar carteira"
        >
          <LogOut size={15} strokeWidth={2.25} className="block shrink-0" />
        </Button>
        <NetworkSettings compact />
      </div>
    </>
  );
}
