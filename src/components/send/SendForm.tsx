"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseSolAmount } from "@/lib/solana/format";
import { isValidSolanaAddress } from "@/lib/solana/validation";
import { CircleAlert, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";

type SendFormProps = {
  solBalance: number | null;
  initialDestination: string;
  initialAmount: string;
  /** Called with raw destination and amount when user clicks Review. Should return a promise. */
  onReview: (destination: string, amount: string) => Promise<void>;
  networkLabel?: string;
  className?: string;
};

export function SendForm({
  solBalance,
  initialDestination,
  initialAmount,
  onReview,
  networkLabel = "Devnet",
  className = "",
}: SendFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [amount, setAmount] = useState(initialAmount);
  const [isReviewing, setIsReviewing] = useState(false);
  const hasDestination = destination.trim().length > 0;
  const addressError =
    hasDestination &&
    !isValidSolanaAddress(destination.trim())
      ? "Endereço inválido"
      : undefined;
  const parsedAmount = parseSolAmount(amount);
  const amountError =
    amount.trim() &&
    (parsedAmount === null || parsedAmount <= 0)
      ? "Informe um valor válido"
      : undefined;

  // Reserve ~5000 lamports (0.000005 SOL) as a safe estimate for MAX calculation.
  // The real fee will be fetched from the network when the user clicks Review.
  const ESTIMATED_FEE_SOL = 0.000005;

  const handleMax = () => {
    if (solBalance === null) return;
    const spendableBalance = Math.max(solBalance - ESTIMATED_FEE_SOL, 0);
    setAmount(
      spendableBalance.toLocaleString("pt-BR", {
        maximumFractionDigits: 9,
      }),
    );
  };

  const handleReview = async () => {
    if (addressError || amountError || !amount.trim() || isReviewing) return;
    setIsReviewing(true);
    try {
      await onReview(destination.trim(), amount.trim());
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Movimentar ativos</p>
          <CardTitle className="mt-2 flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-secondary">
              <Send size={16} />
            </span>
            Enviar
          </CardTitle>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-secondary sm:inline-flex">
          <Sparkles size={12} /> {networkLabel}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <Input
            label="Endereço de destino"
            name="destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Cole um endereço Solana"
            error={addressError}
            suffix={
              addressError ? (
                <CircleAlert
                  size={16}
                  className="text-danger"
                  aria-hidden="true"
                />
              ) : undefined
            }
          />

          <Input
            label="Valor"
            name="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            error={amountError}
            suffix={
              <button
                type="button"
                onClick={handleMax}
                className="rounded-md px-1.5 py-1 text-[11px] font-bold tracking-[0.08em] text-secondary transition-colors hover:bg-primary/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                MAX
              </button>
            }
          />

          <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs">
            <span className="text-muted">Taxa estimada</span>
            <span className="font-mono font-medium text-secondary">
              {isReviewing ? (
                <span className="flex items-center gap-1 text-muted">
                  <Loader2 size={11} className="animate-spin" />
                  Calculando...
                </span>
              ) : (
                "~0.000005 SOL"
              )}
            </span>
          </div>

          <Button
            onClick={handleReview}
            disabled={
              Boolean(addressError || amountError) ||
              !hasDestination ||
              !amount.trim() ||
              isReviewing
            }
            className="mt-1 min-h-12 w-full"
          >
            {isReviewing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Estimando taxa...
              </>
            ) : (
              <>
                Revisar envio <span aria-hidden="true">→</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
