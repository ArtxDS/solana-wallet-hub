import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OFFICIAL_FAUCET_WALLET_ADDRESS } from "@/lib/consts";
import type { WalletSnapshot } from "@/types/wallet";
import { Droplets, TrendingUp } from "lucide-react";

type BalanceCardProps = {
  wallet: WalletSnapshot;
  onAirdrop: () => void;
  isLoading?: boolean;
  isAirdropping?: boolean;
  isAirdropAvailable?: boolean;
  solBalance?: number | null;
  solPriceUsd?: number | null;
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSol(value: number) {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 4,
  })} SOL`;
}

export function BalanceCard({
  wallet,
  onAirdrop,
  isLoading = false,
  isAirdropping = false,
  isAirdropAvailable = true,
  solBalance = null,
  solPriceUsd = null,
}: BalanceCardProps) {
  const displayedBalance =
    solBalance === null ? wallet.balance : formatSol(solBalance);
  const usdBalance =
    solBalance !== null && solPriceUsd !== null
      ? solBalance * solPriceUsd
      : null;
  const isOfficialFaucetWallet =
    wallet.address === OFFICIAL_FAUCET_WALLET_ADDRESS;

  return (
    <Card className="purple-glow flex min-h-51.5 flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <p className="section-kicker">Saldo total</p>
          <CardTitle className="mt-2 text-lg">Seu saldo</CardTitle>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-secondary">
          <TrendingUp size={17} />
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap items-end justify-between gap-5">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-11 w-44" />
              <Skeleton className="mt-3 h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-[2.35rem] font-semibold leading-none tracking-tighter text-white sm:text-[2.7rem]">
                {displayedBalance}
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-secondary">
                  {usdBalance === null
                    ? "Cotação indisponível"
                    : `≈ ${formatUsd(usdBalance)}`}
                </span>
                {solPriceUsd !== null ? (
                  <span className="text-[11px] text-muted">
                    SOL {formatUsd(solPriceUsd)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">{wallet.balanceCaption}</p>
            </>
          )}
        </div>
        {isAirdropAvailable &&
          (isOfficialFaucetWallet ? (
            <span className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-secondary/20 bg-secondary/8 px-4 text-sm font-semibold text-secondary">
              Carteira do Faucet
            </span>
          ) : (
            <Button
              variant="secondary"
              onClick={onAirdrop}
              disabled={isLoading || isAirdropping}
              className="min-h-10 w-full justify-center whitespace-nowrap border border-white/6 lg:min-w-49"
            >
              <Droplets size={16} className="text-secondary" />
              <span className="inline-flex min-w-34 justify-center">
                {isAirdropping ? (
                  "Solicitando..."
                ) : (
                  <>
                    Pedir Airdrop{" "}
                    <span className="ml-1 hidden sm:inline">(0,08 SOL)</span>
                  </>
                )}
              </span>
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}
