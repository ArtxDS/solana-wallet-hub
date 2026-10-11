import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { SendPreview } from "@/types/send";
import { parseSolAmount } from "@/lib/solana/format";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type ConfirmationModalProps = {
  open: boolean;
  preview: SendPreview;
  onClose: () => void;
  onConfirm: () => void;
  networkLabel?: string;
  solBalance?: number | null;
  isSending?: boolean;
};

export function ConfirmationModal({
  open,
  preview,
  onClose,
  onConfirm,
  networkLabel = "Devnet",
  solBalance = null,
  isSending = false,
}: ConfirmationModalProps) {
  const amountSol = parseSolAmount(preview.amount);
  const feeSol = parseSolAmount(preview.fee);
  const requiredSol =
    amountSol !== null && feeSol !== null ? amountSol + feeSol : null;
  const hasValidAmount = amountSol !== null && amountSol > 0;
  const hasKnownBalance = solBalance !== null;
  const hasEnoughBalance =
    hasKnownBalance && requiredSol !== null && requiredSol <= (solBalance ?? 0);
  const canConfirm = hasValidAmount && hasEnoughBalance;

  const formatSolValue = (value: number) =>
    `${value.toLocaleString("pt-BR", {
      maximumFractionDigits: 9,
    })} SOL`;

  const balanceMessage = !hasKnownBalance
    ? `Saldo da ${networkLabel} indisponível. Aguarde a atualização para confirmar.`
    : !hasValidAmount || requiredSol === null
      ? "Informe um valor válido para continuar."
      : !hasEnoughBalance
        ? `Saldo insuficiente na ${networkLabel}. Você precisa de ${formatSolValue(requiredSol)}.`
        : `Saldo suficiente na ${networkLabel} para concluir o envio.`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar envio"
      description="Confira os detalhes antes de continuar."
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-secondary">
            <ArrowRight size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">Destinatário</p>
            <p className="mt-1 truncate font-mono text-sm text-white">
              {preview.destination}
            </p>
          </div>
        </div>

        <dl className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4">
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <dt className="text-muted">Valor</dt>
            <dd className="font-semibold text-white">{preview.amount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <dt className="text-muted">Taxa de rede</dt>
            <dd className="font-mono text-secondary">{preview.fee}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <dt className="font-medium text-white">Total</dt>
            <dd className="font-semibold text-white">{preview.total}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <dt className="text-muted">Saldo disponível</dt>
            <dd className="font-semibold text-white">
              {solBalance === null
                ? "Atualizando..."
                : formatSolValue(solBalance)}
            </dd>
          </div>
        </dl>

        <p
          className={`flex items-start gap-2 text-xs leading-5 ${canConfirm ? "text-muted" : "text-danger"}`}
          role={canConfirm ? undefined : "alert"}
        >
          {canConfirm ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-positive" />
          ) : (
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
          )}
          {balanceMessage}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!canConfirm || isSending}>
            {isSending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
