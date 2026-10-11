import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExplorerUrl, type SolanaNetwork } from "@/lib/solana/config";
import type { WalletSnapshot } from "@/types/wallet";
import { Check, Copy, ExternalLink, WalletCards } from "lucide-react";

type WalletCardProps = {
  wallet: WalletSnapshot;
  copied: boolean;
  onCopy: () => void;
};

export function WalletCard({ wallet, copied, onCopy }: WalletCardProps) {
  const network = (
    wallet.network === "mainnet-beta" ? "mainnet-beta" : "devnet"
  ) as SolanaNetwork;

  return (
    <Card className="flex min-h-[206px] flex-col">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <p className="section-kicker">Carteira conectada</p>
          <CardTitle className="mt-2 flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6e4cf6]/15 text-[#b9a6ff]">
              <WalletCards size={17} />
            </span>
            {wallet.name}
          </CardTitle>
        </div>
        <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          Ativa
        </span>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="mb-2 text-xs text-muted">Endereço público</p>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/2.5 px-3.5 py-1.5">
          <span className="min-w-0 truncate font-mono text-xs text-secondary sm:text-sm">
            {wallet.address}
          </span>
          <Button
            variant="icon"
            onClick={onCopy}
            className="min-h-8 shrink-0 rounded-lg px-2"
            aria-label={copied ? "Endereço copiado" : "Copiar endereço"}
          >
            {copied ? (
              <Check size={15} className="text-positive" />
            ) : (
              <Copy size={15} />
            )}
          </Button>
        </div>
        <a
          href={getExplorerUrl("address", wallet.address, network)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-secondary transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver no Explorer <ExternalLink size={13} />
        </a>
      </CardContent>
    </Card>
  );
}
