import { Check, Clock3, X } from "lucide-react";
import type { TransactionStatus } from "@/types/transaction";

const statusContent: Record<TransactionStatus, { label: string; className: string; icon: typeof Check }> = {
  confirmed: { label: "Confirmado", className: "text-positive bg-positive/10", icon: Check },
  pending: { label: "Pendente", className: "text-warning bg-warning/10", icon: Clock3 },
  failed: { label: "Falhou", className: "text-danger bg-danger/10", icon: X },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const content = statusContent[status];
  const Icon = content.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${content.className}`}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {content.label}
    </span>
  );
}
