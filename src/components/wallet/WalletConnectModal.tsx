"use client";

import { Modal } from "@/components/ui/modal";
import { useSolanaNetwork } from "@/components/providers/SolanaProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Check, WalletCards } from "lucide-react";

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const { wallets, select } = useWallet();
  const { networkLabel } = useSolanaNetwork();
  const detectedWallets = wallets.filter(
    ({ readyState }) => readyState === WalletReadyState.Installed,
  );

  const handleWalletSelect = (walletName: Parameters<typeof select>[0]) => {
    select(walletName);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conecte sua carteira"
      description="Escolha uma carteira para acessar o seu painel."
    >
      {detectedWallets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {detectedWallets.map(({ adapter }) => (
            <button
              key={adapter.name}
              type="button"
              onClick={() => handleWalletSelect(adapter.name)}
              className="group flex min-h-32 flex-col items-start justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.08] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#171026]"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={adapter.icon}
                    alt={`${adapter.name} logo`}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </span>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-positive/15 text-positive"
                  title="Carteira detectada"
                >
                  <Check size={12} strokeWidth={2.5} />
                </span>
              </div>
              <div className="mt-4 min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {adapter.name}
                </p>
                <p className="mt-1 text-xs text-muted">Detectada</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-7 text-center">
          <WalletCards size={24} className="mx-auto text-secondary" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-white">Nenhuma carteira detectada</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Instale ou habilite uma carteira compatível com Solana para continuar.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-xs leading-5 text-muted">
        <WalletCards size={15} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
        <p>Use uma carteira compatível com Solana para continuar na rede {networkLabel}.</p>
      </div>
    </Modal>
  );
}
