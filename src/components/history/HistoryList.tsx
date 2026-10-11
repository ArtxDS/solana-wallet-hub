import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TransactionRecord } from "@/types/transaction";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  History as HistoryIcon,
} from "lucide-react";

type HistoryListProps = {
  transactions: TransactionRecord[];
  isLoading?: boolean;
  networkLabel?: string;
};

function HistorySkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 min-[640px]:hidden">
        {["one", "two", "three", "four"].map((id) => (
          <div
            key={id}
            className="rounded-xl border border-white/6 bg-white/[0.018] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden flex-col gap-3 min-[640px]:flex">
        {["one", "two", "three", "four"].map((id) => (
          <div
            key={id}
            className="grid grid-cols-[1.4fr_0.9fr_1fr_0.8fr_32px] items-center gap-4 rounded-xl border border-white/6 px-4 py-4"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-7 w-7" />
          </div>
        ))}
      </div>
    </>
  );
}

function TransactionType({ transaction }: { transaction: TransactionRecord }) {
  const received = transaction.type === "received";
  const Icon = received ? ArrowDownLeft : ArrowUpRight;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${received ? "bg-positive/10 text-positive" : "bg-primary/10 text-secondary"}`}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-white">
          {received ? "Recebido" : "Enviado"}
        </p>
        <p className="truncate text-xs text-muted">
          {transaction.counterparty}
        </p>
      </div>
    </div>
  );
}

export function HistoryList({
  transactions,
  isLoading = false,
  networkLabel = "Devnet",
}: HistoryListProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Atividade recente</p>
          <CardTitle className="mt-2 flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-secondary">
              <HistoryIcon size={16} />
            </span>
            Histórico de transações
          </CardTitle>
        </div>
        <span className="hidden rounded-full border border-white/8 px-2.5 py-1 text-[10px] font-semibold text-muted sm:inline-flex">
          {networkLabel}
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HistorySkeleton />
        ) : transactions.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-muted">
              <HistoryIcon size={19} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">
              Nenhuma transação ainda
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
              Suas movimentações na {networkLabel} aparecerão aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 min-[640px]:hidden">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex min-h-0 flex-col gap-3 rounded-xl border border-white/6 bg-white/[0.018] p-4 transition-colors hover:border-primary/25 hover:bg-primary/2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <TransactionType transaction={transaction} />
                    <p
                      className={`shrink-0 pt-1 text-sm font-semibold ${transaction.type === "received" ? "text-positive" : "text-white"}`}
                    >
                      {transaction.value}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="text-xs text-muted">{transaction.date}</p>
                      <StatusBadge status={transaction.status} />
                    </div>
                    <a
                      href={transaction.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Ver transação no Explorer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden grid-cols-[1.4fr_0.9fr_1fr_0.8fr_32px] items-center gap-4 px-4 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted min-[640px]:grid">
              <span>Tipo</span>
              <span>Valor</span>
              <span>Data</span>
              <span>Status</span>
              <span />
            </div>
            <div className="hidden flex-col gap-2 min-[640px]:flex">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid gap-4 rounded-xl border border-white/6 bg-white/[0.018] px-4 py-3.5 transition-colors hover:border-primary/25 hover:bg-primary/2.5 min-[640px]:grid-cols-[1.4fr_0.9fr_1fr_0.8fr_32px] min-[640px]:items-center"
                >
                  <TransactionType transaction={transaction} />
                  <p
                    className={`text-sm font-semibold ${transaction.type === "received" ? "text-positive" : "text-white"}`}
                  >
                    {transaction.value}
                  </p>
                  <p className="text-xs text-muted">{transaction.date}</p>
                  <div>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <a
                    href={transaction.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Ver transação no Explorer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
